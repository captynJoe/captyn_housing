import { randomUUID } from "node:crypto";
import type {
  CreateUserReportInput,
  UpdateTicketStatusInput
} from "../validation/schemas.js";

export type UserReportType = "room_issue" | "stolen_item" | "general";
export type TicketStatus = "open" | "triaged" | "in_progress" | "resolved";
export type TicketQueue = "maintenance" | "security";
export type SlaState =
  | "on_track"
  | "breached"
  | "resolved_on_time"
  | "resolved_late";

export interface UserReport {
  id: string;
  buildingId: string;
  buildingName: string;
  houseNumber: string;
  residentPhoneNumber: string;
  queue: TicketQueue;
  type: UserReportType;
  title: string;
  details: string;
  stolenItem?: string;
  status: TicketStatus;
  cctvStatus: "none" | "partial" | "verified";
  cctvGuidance: string;
  incidentWindowStartAt?: string;
  incidentWindowEndAt?: string;
  incidentLocation?: string;
  evidenceAttachments: string[];
  caseReference?: string;
  slaHours: number;
  slaTargetAt: string;
  slaBreached: boolean;
  slaState: SlaState;
  statusUpdatedAt: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  adminNote?: string;
  statusHistory: Array<{
    status: TicketStatus;
    at: string;
    actor: "resident" | "admin" | "system";
    note?: string;
  }>;
}

export interface UserNotification {
  id: string;
  houseNumber: string;
  title: string;
  message: string;
  level: "info" | "warning" | "success";
  source: "ticket" | "rent" | "system";
  createdAt: string;
  reportId?: string;
  dedupeKey?: string;
}

interface BuildingSnapshot {
  id: string;
  name: string;
  cctvStatus: "none" | "partial" | "verified";
}

interface ResidentBinding {
  houseNumber: string;
  phoneNumber: string;
}

export interface SystemNotificationInput {
  title: string;
  message: string;
  level: "info" | "warning" | "success";
  source: "rent" | "system";
  createdAt?: string;
  dedupeKey?: string;
}

export interface ListAllReportFilters {
  status?: TicketStatus;
  queue?: TicketQueue;
  houseNumber?: string;
  buildingId?: string;
  limit?: number;
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeHouseNumber(value: string): string {
  return value.trim().toUpperCase();
}

function queueFor(reportType: UserReportType): TicketQueue {
  return reportType === "stolen_item" ? "security" : "maintenance";
}

function slaHoursFor(reportType: UserReportType): number {
  if (reportType === "stolen_item") {
    return 4;
  }

  if (reportType === "room_issue") {
    return 24;
  }

  return 48;
}

function addHours(iso: string, hours: number): string {
  const ms = new Date(iso).getTime();
  return new Date(ms + hours * 60 * 60 * 1000).toISOString();
}

function cctvGuidanceFor(
  reportType: UserReportType,
  cctvStatus: BuildingSnapshot["cctvStatus"]
): string {
  if (reportType !== "stolen_item") {
    return "Maintenance ticket opened. Team will triage and assign progress updates.";
  }

  if (cctvStatus === "verified") {
    return "CCTV coverage is verified. Security review begins with the provided incident window and evidence.";
  }

  if (cctvStatus === "partial") {
    return "CCTV coverage is partial. Security review will prioritize covered zones and witness evidence.";
  }

  return "No CCTV coverage registered. Escalate to manager and attach non-video evidence immediately.";
}

function createNotificationBase(
  houseNumber: string,
  createdAt = nowIso()
): Pick<UserNotification, "id" | "houseNumber" | "createdAt"> {
  return {
    id: randomUUID(),
    houseNumber,
    createdAt
  };
}

function deriveSlaState(report: UserReport): { breached: boolean; state: SlaState } {
  const nowMs = Date.now();
  const targetMs = new Date(report.slaTargetAt).getTime();
  const resolvedMs = report.resolvedAt
    ? new Date(report.resolvedAt).getTime()
    : undefined;

  if (typeof resolvedMs === "number") {
    if (resolvedMs > targetMs) {
      return { breached: true, state: "resolved_late" };
    }

    return { breached: false, state: "resolved_on_time" };
  }

  if (nowMs > targetMs) {
    return { breached: true, state: "breached" };
  }

  return { breached: false, state: "on_track" };
}

function canTransition(current: TicketStatus, next: TicketStatus): boolean {
  if (current === next) {
    return true;
  }

  const transitions: Record<TicketStatus, TicketStatus[]> = {
    open: ["triaged", "in_progress", "resolved"],
    triaged: ["in_progress", "resolved"],
    in_progress: ["resolved", "triaged"],
    resolved: []
  };

  return transitions[current].includes(next);
}

export class UserSupportService {
  private readonly reportsByHouse = new Map<string, UserReport[]>();
  private readonly reportIndex = new Map<string, string>();
  private readonly notifications = new Map<string, UserNotification[]>();
  private readonly notificationKeys = new Map<string, Set<string>>();

  createReport(
    input: CreateUserReportInput,
    building: BuildingSnapshot,
    resident: ResidentBinding
  ): { report: UserReport; notifications: UserNotification[] } {
    const houseNumber = normalizeHouseNumber(resident.houseNumber);
    const reportType = input.type;
    const createdAt = nowIso();
    const slaHours = slaHoursFor(reportType);

    const report: UserReport = {
      id: randomUUID(),
      buildingId: building.id,
      buildingName: building.name,
      houseNumber,
      residentPhoneNumber: resident.phoneNumber,
      queue: queueFor(reportType),
      type: reportType,
      title: input.title.trim(),
      details: input.details.trim(),
      stolenItem: input.stolenItem?.trim() || undefined,
      status: "open",
      cctvStatus: building.cctvStatus,
      cctvGuidance: cctvGuidanceFor(reportType, building.cctvStatus),
      incidentWindowStartAt: input.incidentWindowStartAt,
      incidentWindowEndAt: input.incidentWindowEndAt,
      incidentLocation: input.incidentLocation?.trim() || undefined,
      evidenceAttachments: input.evidenceAttachments,
      caseReference: input.caseReference?.trim() || undefined,
      slaHours,
      slaTargetAt: addHours(createdAt, slaHours),
      slaBreached: false,
      slaState: "on_track",
      statusUpdatedAt: createdAt,
      createdAt,
      statusHistory: [
        {
          status: "open",
          at: createdAt,
          actor: "resident"
        }
      ]
    };

    const derived = deriveSlaState(report);
    report.slaBreached = derived.breached;
    report.slaState = derived.state;

    const existingReports = this.reportsByHouse.get(houseNumber) ?? [];
    this.reportsByHouse.set(houseNumber, [report, ...existingReports]);
    this.reportIndex.set(report.id, houseNumber);

    const generatedNotifications: UserNotification[] = [
      {
        ...createNotificationBase(houseNumber, createdAt),
        title: "Ticket Opened",
        message: `Ticket ${report.id.slice(0, 8)} is open (${report.queue} queue). SLA target: ${report.slaHours}h.`,
        level: "info",
        source: "ticket",
        reportId: report.id,
        dedupeKey: `ticket-open-${report.id}`
      },
      {
        ...createNotificationBase(houseNumber, createdAt),
        title: reportType === "stolen_item" ? "CCTV Theft Workflow" : "Triage Workflow",
        message: report.cctvGuidance,
        level:
          reportType === "stolen_item" && building.cctvStatus === "none"
            ? "warning"
            : "info",
        source: "ticket",
        reportId: report.id,
        dedupeKey: `ticket-guidance-${report.id}`
      }
    ];

    this.insertNotifications(houseNumber, generatedNotifications);

    return {
      report,
      notifications: generatedNotifications
    };
  }

  listReports(houseNumber: string): UserReport[] {
    const key = normalizeHouseNumber(houseNumber);
    const reports = this.reportsByHouse.get(key) ?? [];

    return reports.map((report) => {
      const derived = deriveSlaState(report);
      return {
        ...report,
        slaBreached: derived.breached,
        slaState: derived.state
      };
    });
  }

  listAllReports(filters: ListAllReportFilters = {}): UserReport[] {
    const all = [...this.reportsByHouse.values()].flatMap((items) => items);

    const filtered = all.filter((report) => {
      if (filters.status && report.status !== filters.status) {
        return false;
      }

      if (filters.queue && report.queue !== filters.queue) {
        return false;
      }

      if (
        filters.houseNumber &&
        report.houseNumber !== normalizeHouseNumber(filters.houseNumber)
      ) {
        return false;
      }

      if (filters.buildingId && report.buildingId !== filters.buildingId) {
        return false;
      }

      return true;
    });

    const sorted = filtered.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    const limited =
      typeof filters.limit === "number" && filters.limit > 0
        ? sorted.slice(0, filters.limit)
        : sorted;

    return limited.map((report) => {
      const derived = deriveSlaState(report);
      return {
        ...report,
        slaBreached: derived.breached,
        slaState: derived.state
      };
    });
  }

  updateReportStatus(
    reportId: string,
    input: UpdateTicketStatusInput,
    actor: "admin" | "system" = "admin"
  ): { report: UserReport; notification: UserNotification } | undefined {
    const houseNumber = this.reportIndex.get(reportId);
    if (!houseNumber) {
      return undefined;
    }

    const reports = this.reportsByHouse.get(houseNumber);
    if (!reports) {
      return undefined;
    }

    const report = reports.find((item) => item.id === reportId);
    if (!report) {
      return undefined;
    }

    if (!canTransition(report.status, input.status)) {
      throw new Error(
        `Invalid ticket transition from ${report.status} to ${input.status}.`
      );
    }

    const updatedAt = nowIso();
    report.status = input.status;
    report.statusUpdatedAt = updatedAt;
    report.adminNote = input.adminNote?.trim() || report.adminNote;

    if (input.status === "resolved") {
      report.resolvedAt = updatedAt;
      report.resolutionNotes = input.resolutionNotes?.trim() || report.resolutionNotes;
    }

    const derived = deriveSlaState(report);
    report.slaBreached = derived.breached;
    report.slaState = derived.state;

    report.statusHistory.unshift({
      status: input.status,
      at: updatedAt,
      actor,
      note: input.resolutionNotes?.trim() || input.adminNote?.trim()
    });

    const notification: UserNotification = {
      ...createNotificationBase(houseNumber, updatedAt),
      title: "Ticket Update",
      message: `Ticket ${report.id.slice(0, 8)} moved to ${report.status.replace("_", " ")}.`,
      level: report.status === "resolved" ? "success" : "info",
      source: "ticket",
      reportId: report.id,
      dedupeKey: `ticket-status-${report.id}-${report.status}-${updatedAt.slice(0, 16)}`
    };

    this.insertNotifications(houseNumber, [notification]);

    return { report, notification };
  }

  listNotifications(houseNumber: string): UserNotification[] {
    const key = normalizeHouseNumber(houseNumber);
    return this.notifications.get(key) ?? [];
  }

  enqueueSystemNotifications(
    houseNumber: string,
    notifications: SystemNotificationInput[]
  ): UserNotification[] {
    const key = normalizeHouseNumber(houseNumber);

    const mapped = notifications.map((item) => ({
      ...createNotificationBase(key, item.createdAt),
      title: item.title,
      message: item.message,
      level: item.level,
      source: item.source,
      dedupeKey: item.dedupeKey
    }));

    return this.insertNotifications(key, mapped);
  }

  private insertNotifications(
    houseNumber: string,
    notifications: UserNotification[]
  ): UserNotification[] {
    const key = normalizeHouseNumber(houseNumber);
    const dedupe = this.notificationKeys.get(key) ?? new Set<string>();
    const existing = this.notifications.get(key) ?? [];
    const inserted: UserNotification[] = [];

    for (const item of notifications) {
      const dedupeKey = item.dedupeKey;
      if (dedupeKey && dedupe.has(dedupeKey)) {
        continue;
      }

      if (dedupeKey) {
        dedupe.add(dedupeKey);
      }

      inserted.push(item);
    }

    this.notificationKeys.set(key, dedupe);
    if (inserted.length > 0) {
      this.notifications.set(key, [...inserted, ...existing]);
    }

    return inserted;
  }
}
