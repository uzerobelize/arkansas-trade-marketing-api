"use client"

import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Video,
  ExternalLink,
} from "lucide-react";


export interface BookingData {
  contractorName: string;
  companyName: string;
  tradeFocus: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  timezone: string;
  selectedIsoSlot?: string;
  meetLink?: string;
  bookingId?: number | null;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  onBookingComplete?: (bookingData: BookingData) => void;
}

interface AvailabilityApiResponse {
  date: string;
  timezone: string;
  availableSlots: string[]; // ISO string array e.g. ["2026-10-21T14:00:00.000Z"]
  error?: string;
}

interface BookingApiResponse {
  message: string;
  bookingId?: number | null;
  meetLink?: string;
  isDuplicate?: boolean;
  error?: string;
}

// Timezone mapper helper
const getTimezoneString = (tz: string) => {
  switch (tz) {
    case "CST":
      return "America/Chicago";
    case "EST":
      return "America/New_York";
    case "MST":
      return "America/Denver";
    case "PST":
      return "America/Los_Angeles";
    default:
      return tz;
  }
};

interface MonthCell {
  dayNum: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isWeekend?: boolean;
  isPast: boolean;
}

interface WeekDay {
  dateStr: string;
  dayNum: number;
  dayName: string;
  monthName: string;
  isPast: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatDateStr = (year: number, month: number, day: number) => {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialStep = 1,
  onBookingComplete,
}) => {
  const [bookingStep, setBookingStep] = useState<number>(initialStep);

  const [formData, setFormData] = useState({
    contractorName: "",
    companyName: "",
    tradeFocus: "Siding & Trim",
    phone: "",
    email: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calendar state (no new Date() during SSR render)
  const [todayStr, setTodayStr] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedIsoSlot, setSelectedIsoSlot] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] = useState("CST");
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week">("month");
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(10);
  const [monthCalendarGrid, setMonthCalendarGrid] = useState<MonthCell[]>([]);
  const [weekViewDays, setWeekViewDays] = useState<WeekDay[]>([]);

  // API states
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingApiResponse | null>(null);

  // Initialize live client date after mount (runs only in browser)
  useEffect(() => {
    const now = new Date();
    const formattedToday = formatDateStr(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    setTodayStr(formattedToday);
    setSelectedDate((prev) => prev || formattedToday);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  }, []);

  // Build Month Grid on client whenever viewYear, viewMonth, or todayStr changes
  useEffect(() => {
    if (!todayStr) return;

    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const grid: MonthCell[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      grid.push({
        dayNum,
        dateStr: formatDateStr(prevY, prevM, dayNum),
        isCurrentMonth: false,
        isPast: true,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateStr(viewYear, viewMonth, d);
      const dayOfWeek = new Date(viewYear, viewMonth, d).getDay();
      grid.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isPast: dateStr < todayStr,
      });
    }

    const totalCells = grid.length > 35 ? 42 : 35;
    const remainingCells = totalCells - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      grid.push({
        dayNum: i,
        dateStr: formatDateStr(nextY, nextM, i),
        isCurrentMonth: false,
        isPast: false,
      });
    }

    setMonthCalendarGrid(grid);
  }, [viewYear, viewMonth, todayStr]);

  // Build Week Strip on client whenever selectedDate or todayStr changes
  useEffect(() => {
    if (!selectedDate || !todayStr) return;

    const baseDate = new Date(`${selectedDate}T00:00:00`);
    const dayOfWeek = baseDate.getDay();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

    const days: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
      days.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        monthName: SHORT_MONTH_NAMES[d.getMonth()],
        isPast: dateStr < todayStr,
      });
    }

    setWeekViewDays(days);
  }, [selectedDate, todayStr]);

  // Client-side Step 1 Validation matching createBookingSchema
  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (formData.contractorName.trim().length < 2) {
      errors.contractorName = "Name must be at least 2 characters";
    }

    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Invalid email address";
    }

    // Ensure phone has at least 10 digits
    const cleanedPhone = formData.phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      errors.phone = "Valid phone number required (at least 10 digits)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleTodayMonth = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(formatDateStr(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchAvailability = async () => {
    if (!selectedDate) return;

    setIsLoadingSlots(true);
    setAvailabilityError(null);
    setSelectedIsoSlot(""); // Reset selection on date/tz change

    try {
      const host = 'https://api.arkansastrademarketing.com';
      const url = `/hono-api/availability?date=${encodeURIComponent(selectedDate)}&timezone=${encodeURIComponent(selectedTimezone)}`;
      const response = await fetch(`${host}${url}`);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: AvailabilityApiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAvailableSlots(data.availableSlots || []);
    } catch (err) {
      console.error("Error fetching availability slots:", err);
      setAvailabilityError(
        err instanceof Error
          ? err.message
          : "Failed to load available time slots.",
      );
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedIsoSlot) return;

    setIsSubmitting(true);
    setBookingError(null);

    // Calculate endTime (30 mins after selectedIsoSlot)
    const startTimeDate = new Date(selectedIsoSlot);
    const endTimeDate = new Date(startTimeDate.getTime() + 30 * 60 * 1000);

    const bookingPayload = {
      name: formData.contractorName.trim(),
      company: formData.companyName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      notes: `Trade Focus: ${formData.tradeFocus}`,
      startTime: selectedIsoSlot,
      endTime: endTimeDate.toISOString(),
      timezone: selectedTimezone,
    };

    try {
      const host = 'https://api.arkansastrademarketing.com';
      const endpoint = '/hono-api/bookings';
      const url = `${host}${endpoint}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data: BookingApiResponse = await response.json();

      if (response.status === 409) {
        // Double booking conflict: notify user & refresh availability
        setBookingError(data.error || "This time slot is no longer available.");
        setSelectedIsoSlot("");
        fetchAvailability();
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to process booking reservation.");
      }

      // Success
      setBookingResult(data);
      const completedData: BookingData = {
        ...formData,
        date: selectedDate,
        time: formatSlotTime(selectedIsoSlot, selectedTimezone),
        timezone: selectedTimezone,
        selectedIsoSlot,
        meetLink: data.meetLink,
        bookingId: data.bookingId,
      };

      if (onBookingComplete) {
        onBookingComplete(completedData);
      }

      setBookingStep(3);
    } catch (err) {
      console.error("Booking Submission Error:", err);
      setBookingError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formats UTC ISO 8601 string to local time (e.g. "09:30 AM")
  const formatSlotTime = (isoString: string, timezone: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const targetTz = getTimezoneString(timezone);
  
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: targetTz,
      }).format(date);
    } catch (err) {
      console.error("Error formatting slot time:", err);
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#002D3C]/70 backdrop-blur-md overflow-y-auto">
      <div
        className="bg-white border-2 border-[#0093B3]/30 rounded-3xl w-full max-w-3xl shadow-2xl relative overflow-hidden my-8 text-[#002D3C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#0093B3]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#002D3C] flex items-center justify-center text-[#F9C846] font-extrabold text-sm shadow-md">
              SDI
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#002D3C]">
                Little Rock Strategy Call Reservation
              </h3>
              <p className="text-[10px] text-[#0093B3] font-mono font-bold uppercase tracking-wider">
                Step {bookingStep} of 3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#002D3C]/60 hover:text-[#002D3C] rounded-lg hover:bg-[#0093B3]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: CONTACT INTAKE FORM */}
          {bookingStep === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (validateStep1()) {
                  setBookingStep(2);
                }
              }}
              className="space-y-5"
              noValidate
            >
              <div className="text-center max-w-md mx-auto mb-6">
                <h3 className="text-xl font-black text-[#002D3C]">
                  Contractor Qualification Intake
                </h3>
                <p className="text-xs text-[#002D3C]/70 mt-1 font-medium">
                  Enter your business info to verify territory availability in
                  Pulaski County.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002D3C] mb-1">
                    Contractor / Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mark Tidd"
                    value={formData.contractorName}
                    onChange={(e) =>
                      handleInputChange("contractorName", e.target.value)
                    }
                    className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:bg-white focus:outline-none transition-colors ${
                      formErrors.contractorName
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#0093B3]/30 focus:border-[#0093B3]"
                    }`}
                  />
                  {formErrors.contractorName && (
                    <p className="text-red-500 text-[11px] font-bold mt-1">
                      {formErrors.contractorName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002D3C] mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tidd Siding & Remodeling"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:bg-white focus:outline-none transition-colors ${
                      formErrors.companyName
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#0093B3]/30 focus:border-[#0093B3]"
                    }`}
                  />
                  {formErrors.companyName && (
                    <p className="text-red-500 text-[11px] font-bold mt-1">
                      {formErrors.companyName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002D3C] mb-1">
                    Cell Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(501) 555-0199"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:bg-white focus:outline-none transition-colors ${
                      formErrors.phone
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#0093B3]/30 focus:border-[#0093B3]"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-[11px] font-bold mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002D3C] mb-1">
                    Direct Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@tiddsiding.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:bg-white focus:outline-none transition-colors ${
                      formErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#0093B3]/30 focus:border-[#0093B3]"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-[11px] font-bold mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002D3C] mb-1">
                  Primary Trade Focus
                </label>
                <select
                  value={formData.tradeFocus}
                  onChange={(e) =>
                    setFormData({ ...formData, tradeFocus: e.target.value })
                  }
                  className="w-full bg-[#F8FAFC] border border-[#0093B3]/30 rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:border-[#0093B3] focus:bg-white focus:outline-none"
                >
                  <option value="Siding & Trim">
                    Siding & Trim Specialist
                  </option>
                  <option value="Roofing & Gutters">
                    Roofing & Seamless Gutters
                  </option>
                  <option value="Full Exterior Remodel">
                    Full Exterior Remodeling
                  </option>
                  <option value="General Exterior Contractor">
                    General Exterior Contractor
                  </option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full bg-[#F96E46] hover:bg-[#e25d36] text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <span>Proceed to Calendar Slots</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: CALENDAR & LIVE AVAILABILITY CHECK */}
          {bookingStep === 2 && (
            <div className="space-y-6">
              {/* Controls Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-[#0093B3]/30">
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-[#0093B3]/20 text-xs">
                  <button
                    type="button"
                    onClick={() => setCalendarViewMode("month")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      calendarViewMode === "month"
                        ? "bg-[#002D3C] text-white shadow-sm"
                        : "text-[#002D3C]/70 hover:text-[#002D3C]"
                    }`}
                  >
                    Month View
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarViewMode("week")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      calendarViewMode === "week"
                        ? "bg-[#002D3C] text-white shadow-sm"
                        : "text-[#002D3C]/70 hover:text-[#002D3C]"
                    }`}
                  >
                    Week View
                  </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 text-[#002D3C]/70 hover:text-[#002D3C] hover:bg-[#0093B3]/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-sm font-bold text-[#002D3C] font-mono">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 text-[#002D3C]/70 hover:text-[#002D3C] hover:bg-[#0093B3]/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTodayMonth}
                    className="text-[11px] font-mono text-[#0093B3] bg-[#0093B3]/10 hover:bg-[#0093B3]/20 px-2.5 py-1 rounded-md border border-[#0093B3]/30 transition-colors cursor-pointer font-bold"
                  >
                    Today
                  </button>
                </div>

                {/* Timezone Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#002D3C]/70 font-mono font-bold">
                    TZ:
                  </span>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="bg-white border border-[#0093B3]/30 rounded-lg px-2.5 py-1 text-xs text-[#002D3C] font-mono font-bold focus:outline-none"
                  >
                    <option value="CST">CST (Central - Little Rock)</option>
                    <option value="EST">EST (Eastern)</option>
                    <option value="MST">MST (Mountain)</option>
                    <option value="PST">PST (Pacific)</option>
                  </select>
                </div>
              </div>

              {/* Month View Grid */}
              {calendarViewMode === "month" ? (
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#0093B3]/30">
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono font-black text-[#0093B3] uppercase pb-2 border-b border-[#0093B3]/20">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mt-2 text-center text-xs font-mono">
                    {monthCalendarGrid.map((cell, idx) => {
                      const isSelected = selectedDate === cell.dateStr;

                      return (
                        <button
                          key={idx}
                          disabled={cell.isPast || !cell.isCurrentMonth}
                          onClick={() => setSelectedDate(cell.dateStr)}
                          className={`p-2.5 rounded-xl font-bold transition-all relative ${
                            isSelected
                              ? "bg-[#F96E46] text-white font-black shadow-md scale-105 z-10 cursor-pointer"
                              : !cell.isCurrentMonth
                                ? "text-gray-300 cursor-not-allowed"
                                : cell.isPast
                                  ? "text-gray-400/60 cursor-not-allowed line-through"
                                  : "text-[#002D3C] hover:bg-[#0093B3]/15 cursor-pointer"
                          }`}
                        >
                          <span>{cell.dayNum}</span>
                          {isSelected && (
                            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Week View Grid */
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#0093B3]/30">
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {weekViewDays.map((day, idx) => {
                      const isSelected = selectedDate === day.dateStr;

                      return (
                        <button
                          key={idx}
                          disabled={day.isPast}
                          onClick={() => setSelectedDate(day.dateStr)}
                          className={`p-3 rounded-xl border transition-all flex flex-col items-center ${
                            isSelected
                              ? "bg-[#F96E46] border-[#F96E46] text-white font-black shadow-md scale-105 cursor-pointer"
                              : day.isPast
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white border-[#0093B3]/30 text-[#002D3C] hover:border-[#0093B3] cursor-pointer font-bold"
                          }`}
                        >
                          <span className="text-[10px] font-mono uppercase text-[#0093B3]">
                            {day.dayName}
                          </span>
                          <span className="text-lg font-bold my-1">
                            {day.dayNum}
                          </span>
                          <span className="text-[9px] font-mono">
                            {day.monthName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Time Slot Picker Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[#002D3C] uppercase tracking-wider flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#F96E46]" />
                    <span>Available Strategy Call Slots ({selectedDate})</span>
                  </label>
                  <span className="text-[11px] text-[#0093B3] font-mono font-bold">
                    ● Live Google Calendar Sync
                  </span>
                </div>

                {/* API Availability or Booking Error State Banner */}
                {(availabilityError || bookingError) && (
                  <div className="p-4 mb-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{bookingError || availabilityError}</span>
                    </div>
                    {availabilityError && (
                      <button
                        type="button"
                        onClick={fetchAvailability}
                        className="inline-flex items-center gap-1 font-bold underline hover:text-red-900 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    )}
                  </div>
                )}

                {/* API Loading Skeleton */}
                {isLoadingSlots ? (
                  <div className="bg-[#F8FAFC] border border-[#0093B3]/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-[#0093B3] animate-spin" />
                    <span className="text-xs font-mono font-bold text-[#002D3C]/70">
                      Querying Google Calendar availability...
                    </span>
                  </div>
                ) : availableSlots.length === 0 && !availabilityError ? (
                  /* Empty State */
                  <div className="bg-[#F8FAFC] border border-[#0093B3]/20 rounded-2xl p-8 text-center">
                    <p className="text-xs text-[#002D3C]/70 font-semibold">
                      No strategy call slots available for {selectedDate}.
                      Please select another date on the calendar.
                    </p>
                  </div>
                ) : (
                  /* Live Slots Grid */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {availableSlots.map((isoSlot) => {
                      const displayTime = formatSlotTime(
                        isoSlot,
                        selectedTimezone,
                      );
                      const isSelected = selectedIsoSlot === isoSlot;

                      return (
                        <button
                          key={isoSlot}
                          type="button"
                          onClick={() => {
                            setSelectedIsoSlot(isoSlot);
                            setBookingError(null);
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#F96E46] text-white border border-[#F96E46] shadow-md scale-105 z-10"
                              : "bg-white text-[#002D3C] border border-[#0093B3]/30 hover:border-[#0093B3] hover:bg-[#E8EBF7]/60"
                          }`}
                        >
                          <span>{displayTime}</span>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#0093B3]"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#0093B3]/20">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setBookingStep(1)}
                  className="px-4 py-2.5 text-xs text-[#002D3C]/70 hover:text-[#002D3C] font-bold cursor-pointer disabled:opacity-50"
                >
                  ← Back to Details
                </button>

                <button
                  type="button"
                  disabled={!selectedIsoSlot || isSubmitting}
                  onClick={handleConfirmBooking}
                  className="bg-[#F96E46] hover:bg-[#e25d36] disabled:opacity-50 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Reserving Slot...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Appointment</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION SCREEN */}
          {bookingStep === 3 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-[#0093B3]/10 border-2 border-[#0093B3] rounded-full flex items-center justify-center text-[#0093B3] mx-auto shadow-sm">
                <Check className="w-8 h-8 text-[#0093B3]" />
              </div>

              <div>
                <span className="text-[#0093B3] text-xs font-mono font-bold uppercase tracking-widest bg-[#0093B3]/10 border border-[#0093B3]/30 px-3 py-1 rounded-md">
                  Territory Slot Reserved
                </span>
                <h3 className="text-2xl font-black text-[#002D3C] mt-3">
                  Strategy Call Confirmed!
                </h3>
                <p className="text-xs text-[#002D3C]/70 mt-1 font-medium">
                  {bookingResult?.isDuplicate
                    ? "Welcome back! Your existing lead record has been updated with this new reservation."
                    : "Calendar invite and email confirmation have been dispatched."}
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-[#F8FAFC] border border-[#0093B3]/30 p-6 rounded-2xl max-w-md mx-auto text-left space-y-3 font-mono text-xs shadow-sm">
                <div className="flex justify-between border-b border-[#0093B3]/20 pb-2">
                  <span className="text-[#002D3C]/70">Date & Time:</span>
                  <span className="text-[#F96E46] font-bold">
                    {selectedDate} @{" "}
                    {formatSlotTime(selectedIsoSlot, selectedTimezone)} (
                    {selectedTimezone})
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#0093B3]/20 pb-2">
                  <span className="text-[#002D3C]/70">Contractor:</span>
                  <span className="text-[#002D3C] font-bold">
                    {formData.contractorName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#0093B3]/20 pb-2">
                  <span className="text-[#002D3C]/70">Company:</span>
                  <span className="text-[#002D3C] font-bold">
                    {formData.companyName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#0093B3]/20 pb-2">
                  <span className="text-[#002D3C]/70">Direct Cell:</span>
                  <span className="text-[#002D3C] font-bold">
                    {formData.phone}
                  </span>
                </div>

                {/* Google Meet Link Display */}
                {bookingResult?.meetLink && (
                  <div className="pt-2 flex items-center justify-between bg-white p-3 rounded-xl border border-[#0093B3]/30">
                    <div className="flex items-center space-x-2 text-[#0093B3] font-bold">
                      <Video className="w-4 h-4" />
                      <span>Google Meet:</span>
                    </div>
                    <a
                      href={bookingResult.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[#F96E46] hover:underline font-bold"
                    >
                      <span>Join Call</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto bg-[#F96E46] hover:bg-[#e25d36] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
