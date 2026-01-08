import { HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';
import { ImageService } from '../image/image.service';

@Injectable()
export class DocService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
  ) {}

  async getWeekCalendar(docUserId: number, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throwAppError(
        ErrorCode.INVALID_DATE_RANGE,
        HttpStatus.BAD_REQUEST,
        'Invalid from/to date format',
      );
    }
    if (fromDate > toDate) {
      throwAppError(
        ErrorCode.INVALID_DATE_RANGE,
        HttpStatus.BAD_REQUEST,
        'from must be <= to',
      );
    }

    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
      select: { id: true },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    const [slots, meetings] = await this.prisma.$transaction([
      this.prisma.availabilitySlot.findMany({
        where: {
          docId: docProfile.id,
          startTime: { gte: fromDate, lt: toDate },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          booked: true,
        },
        orderBy: { startTime: 'asc' },
      }),

      this.prisma.meeting.findMany({
        where: {
          docId: docProfile.id,
          status: 'confirmed',
          startTime: { gte: fromDate, lte: toDate },
        },
        select: {
          id: true,
          slotId: true,
          startTime: true,
          endTime: true,
          status: true,
          clientMessage: true,
          user: {
            select: { firstName: true, lastName: true },
          },
          payments: {
            where: { status: 'succeeded' },
            select: { id: true },
            take: 1,
          },
        },
        orderBy: { startTime: 'asc' },
      }),
    ]);

    const meetingBySlotId = new Map<number, { id: number }>();
    for (const m of meetings) {
      if (m.slotId) meetingBySlotId.set(m.slotId, m);
    }

    return {
      range: { from: fromDate.toISOString(), to: toDate.toISOString() },
      slots: slots.map((s) => ({
        ...s,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        meetingId: meetingBySlotId.get(s.id)?.id ?? null,
      })),
      meetings: meetings.map((m) => ({
        id: m.id,
        slotId: m.slotId ?? null,
        startTime: m.startTime.toISOString(),
        endTime: m.endTime.toISOString(),
        status: m.status,
        paid: m.payments.length > 0,
        clientName:
          m.user?.firstName || m.user?.lastName
            ? `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`.trim()
            : null,
        clientMessage: m.clientMessage ?? null,
      })),
    };
  }

  private validateVerificationDoc(file: Express.Multer.File) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxBytes = 10 * 1024 * 1024;

    if (!file) {
      throwAppError(
        ErrorCode.INVALID_REQUEST,
        HttpStatus.BAD_REQUEST,
        'No file',
      );
    }
    if (!allowed.includes(file.mimetype)) {
      throwAppError(
        ErrorCode.INVALID_REQUEST,
        HttpStatus.BAD_REQUEST,
        'Invalid file type',
      );
    }
    if (file.size > maxBytes) {
      throwAppError(
        ErrorCode.INVALID_REQUEST,
        HttpStatus.BAD_REQUEST,
        'File too large',
      );
    }
  }

  async uploadVerificationDocument(
    docUserId: number,
    file: Express.Multer.File,
  ) {
    this.validateVerificationDoc(file);

    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
      select: { id: true, verificationStatus: true },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    const ext =
      file.mimetype === 'application/pdf'
        ? 'pdf'
        : file.mimetype === 'image/png'
          ? 'png'
          : 'jpg';

    const key = `doc-verification/${docProfile.id}/${uuid()}.${ext}`;

    await this.imageService.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
      cacheControl: 'private, max-age=0',
    });

    return await this.prisma.docVerificationDocument.create({
      data: {
        docId: docProfile.id,
        fileKey: key,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        originalName: file.originalname,
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        uploadedAt: true,
      },
    });
  }

  async listVerificationDocuments(docUserId: number) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
      select: { id: true },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    return await this.prisma.docVerificationDocument.findMany({
      where: { docId: docProfile.id },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        uploadedAt: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async deleteVerificationDocument(docUserId: number, documentId: number) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
      select: { id: true },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    const doc = await this.prisma.docVerificationDocument.findFirst({
      where: { id: documentId, docId: docProfile.id },
      select: { id: true, fileKey: true },
    });

    if (!doc) {
      throwAppError(
        ErrorCode.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Document not found',
      );
    }

    await this.prisma.docVerificationDocument.delete({ where: { id: doc.id } });
    await this.imageService.deleteObject(doc.fileKey).catch(() => {});
    return { ok: true };
  }

  async getVerificationDocumentUrl(documentId: number) {
    const doc = await this.prisma.docVerificationDocument.findUnique({
      where: { id: documentId },
      select: { fileKey: true },
    });

    if (!doc) {
      throwAppError(
        ErrorCode.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Document not found',
      );
    }

    return {
      url: await this.imageService.getObjectSignedUrl(doc.fileKey, 300),
    };
  }
}
