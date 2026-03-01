import { z } from "zod";

export const cctvStatusSchema = z.enum(["none", "partial", "verified"]);
export const incidentSeveritySchema = z.enum(["low", "medium", "high"]);
export const incidentStatusSchema = z.enum([
  "open",
  "triaged",
  "in_progress",
  "resolved"
]);

const nonEmptyString = z.string().trim().min(1);
const optionalStringList = z.array(nonEmptyString).default([]);

export const createBuildingSchema = z.object({
  name: nonEmptyString,
  address: nonEmptyString,
  county: nonEmptyString,
  cctvStatus: cctvStatusSchema.default("none"),
  units: z.number().int().positive().optional(),
  media: z.object({
    imageUrls: optionalStringList,
    videoUrls: optionalStringList,
    floorPlanUrl: z.string().trim().url().optional(),
    neighborhoodNotes: z.string().trim().optional()
  })
});

export const createIncidentSchema = z.object({
  title: nonEmptyString,
  details: nonEmptyString,
  severity: incidentSeveritySchema.default("medium")
});

export const resolveIncidentSchema = z.object({
  resolutionNotes: z.string().trim().min(1).optional()
});

export const updateIncidentStatusSchema = z.object({
  status: incidentStatusSchema,
  resolutionNotes: z.string().trim().min(1).max(500).optional()
});

export const createVacancySnapshotSchema = z.object({
  movedOutAt: z.string().datetime(),
  beforeImageUrls: optionalStringList,
  afterImageUrls: optionalStringList,
  videoUrls: optionalStringList,
  structuralChanges: optionalStringList,
  damages: optionalStringList,
  repairs: optionalStringList,
  notes: z.string().trim().optional()
});

export const wifiPackageIdSchema = z.enum([
  "hour_1",
  "hour_3",
  "hour_8",
  "day_24"
]);

export const kenyaPhoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+254|254|0)(?:7\d{8}|1\d{8})$/, {
    message: "Use a valid Kenyan number (e.g. 07..., 01..., or +254...)"
  });

export const createWifiPaymentSchema = z.object({
  buildingId: nonEmptyString,
  packageId: wifiPackageIdSchema,
  phoneNumber: kenyaPhoneSchema
});

export const confirmWifiPaymentSchema = z.object({
  status: z.enum(["success", "failed"]),
  providerReference: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1).optional()
});

export const updateWifiPackageSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    profile: z.string().trim().min(1).max(100).optional(),
    hours: z.number().int().min(1).max(72).optional(),
    priceKsh: z.number().int().min(1).max(10_000).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one package field to update."
  });

export const userReportTypeSchema = z.enum([
  "room_issue",
  "stolen_item",
  "general"
]);

const optionalDateTimeSchema = z.string().datetime().optional();

export const createUserReportSchema = z
  .object({
    type: userReportTypeSchema,
    title: nonEmptyString.max(100),
    details: z.string().trim().min(5).max(1500),
    stolenItem: z.string().trim().max(120).optional(),
    incidentWindowStartAt: optionalDateTimeSchema,
    incidentWindowEndAt: optionalDateTimeSchema,
    incidentLocation: z.string().trim().max(120).optional(),
    evidenceAttachments: z.array(z.string().trim().url()).max(8).default([]),
    caseReference: z.string().trim().max(80).optional()
  })
  .superRefine((value, context) => {
    if (value.type === "stolen_item") {
      if (!value.stolenItem) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stolenItem"],
          message: "Stolen item is required when reporting theft."
        });
      }

      if (!value.incidentWindowStartAt) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["incidentWindowStartAt"],
          message: "Incident start time is required for theft workflow."
        });
      }

      if (!value.incidentWindowEndAt) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["incidentWindowEndAt"],
          message: "Incident end time is required for theft workflow."
        });
      }

      if (!value.incidentLocation) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["incidentLocation"],
          message: "Incident location is required for theft workflow."
        });
      }
    }

    if (value.incidentWindowStartAt && value.incidentWindowEndAt) {
      const startMs = new Date(value.incidentWindowStartAt).getTime();
      const endMs = new Date(value.incidentWindowEndAt).getTime();

      if (endMs < startMs) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["incidentWindowEndAt"],
          message: "Incident end time must be after start time."
        });
      }
    }
  });

export const houseNumberQuerySchema = z.object({
  houseNumber: nonEmptyString.max(24)
});

export const upsertRentDueSchema = z.object({
  monthlyRentKsh: z.number().int().min(0).max(500_000),
  balanceKsh: z.number().int().min(0).max(500_000),
  dueDate: z.string().datetime(),
  note: z.string().trim().max(280).optional()
});

export const ticketStatusSchema = z.enum([
  "open",
  "triaged",
  "in_progress",
  "resolved"
]);

export const updateTicketStatusSchema = z.object({
  status: ticketStatusSchema,
  resolutionNotes: z.string().trim().max(500).optional(),
  adminNote: z.string().trim().max(500).optional()
});

export const residentOtpRequestSchema = z.object({
  buildingId: nonEmptyString,
  houseNumber: nonEmptyString.max(24),
  phoneNumber: kenyaPhoneSchema
});

export const residentOtpVerifySchema = z.object({
  challengeId: nonEmptyString,
  otpCode: z.string().trim().regex(/^\d{6}$/)
});

export const adminLoginSchema = z
  .object({
    accessToken: z.string().trim().max(200).optional(),
    username: z.string().trim().max(80).optional(),
    password: z.string().trim().max(120).optional()
  })
  .superRefine((value, context) => {
    const hasToken = Boolean(value.accessToken && value.accessToken.length > 0);
    const hasUsername = Boolean(value.username && value.username.length > 0);
    const hasPassword = Boolean(value.password && value.password.length > 0);

    if (hasToken) {
      return;
    }

    if (hasUsername && hasPassword) {
      return;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["accessToken"],
      message: "Provide either accessToken or username/password."
    });
  });

export const rentMpesaCallbackSchema = z.object({
  houseNumber: nonEmptyString.max(24),
  amountKsh: z.number().positive().max(500_000),
  providerReference: nonEmptyString.max(120),
  phoneNumber: kenyaPhoneSchema.optional(),
  paidAt: z.string().datetime().optional(),
  rawPayload: z.unknown().optional()
});

export type CreateBuildingInput = z.infer<typeof createBuildingSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type ResolveIncidentInput = z.infer<typeof resolveIncidentSchema>;
export type UpdateIncidentStatusInput = z.infer<typeof updateIncidentStatusSchema>;
export type CreateVacancySnapshotInput = z.infer<
  typeof createVacancySnapshotSchema
>;
export type CreateWifiPaymentInput = z.infer<typeof createWifiPaymentSchema>;
export type ConfirmWifiPaymentInput = z.infer<typeof confirmWifiPaymentSchema>;
export type UpdateWifiPackageInput = z.infer<typeof updateWifiPackageSchema>;
export type CreateUserReportInput = z.infer<typeof createUserReportSchema>;
export type UpsertRentDueInput = z.infer<typeof upsertRentDueSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type ResidentOtpRequestInput = z.infer<typeof residentOtpRequestSchema>;
export type ResidentOtpVerifyInput = z.infer<typeof residentOtpVerifySchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type RentMpesaCallbackInput = z.infer<typeof rentMpesaCallbackSchema>;
