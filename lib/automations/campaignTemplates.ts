import type { CampaignTemplate } from "@/types";
import { campaignStore } from "@/lib/db/store";

export const DEFAULT_CAMPAIGNS: CampaignTemplate[] = [
    {
        id: "camp_hygiene_001",
        name: "Overdue Hygiene Recall",
        targetSegment: "overdue_hygiene",
        status: "paused",
        steps: [
            {
                dayOffset: 0,
                content: "Hi {{first_name}}, it's time for your next cleaning! We noticed it's been a while since your last visit. Reply to this text to schedule your appointment."
            },
            {
                dayOffset: 3,
                content: "Hi {{first_name}} - just following up on our previous message. Regular cleanings are essential for your dental health. Can we get you on the schedule this week?"
            },
            {
                dayOffset: 7,
                content: "Hi {{first_name}}, this is our final reminder regarding your overdue hygiene appointment. Please let us know if you'd like to schedule, otherwise we'll check back in a few months."
            }
        ]
    },
    {
        id: "camp_treatment_001",
        name: "Unscheduled Treatment Follow-up",
        targetSegment: "unscheduled_treatment",
        status: "paused",
        steps: [
            {
                dayOffset: 0,
                content: "Hi {{first_name}}, this is our team following up on the treatment plan Dr. Smith discussed with you. Delaying care can lead to more expensive procedures later. Reply to book."
            },
            {
                dayOffset: 4,
                content: "Hi {{first_name}} - we still have your treatment plan ready. Do you have any questions about the procedure or financing options? We're here to help."
            }
        ]
    },
    {
        id: "camp_reactivation_001",
        name: "Inactive Patient Reactivation",
        targetSegment: "inactive_patient",
        status: "paused",
        steps: [
            {
                dayOffset: 0,
                content: "Hi {{first_name}}, we miss you at the clinic! It's been over 18 months since we last saw you. Enjoy a complimentary teeth whitening kit when you book your next exam."
            },
            {
                dayOffset: 5,
                content: "Hi {{first_name}}, just checking to see if you received our complimentary whitening offer. Reply YES to claim it and get scheduled for your exam."
            }
        ]
    },
    {
        id: "camp_reschedule_001",
        name: "Reschedule Recovery",
        targetSegment: "recently_cancelled",
        status: "paused",
        steps: [
            {
                dayOffset: 0,
                content: "Hi {{first_name}}, we noticed your recent appointment was cancelled. We'd love to get you back on the schedule — reply to this message and we'll find a time that works for you!"
            },
            {
                dayOffset: 2,
                content: "Hi {{first_name}}, just following up! We still have openings this week. Rescheduling now helps protect your dental health. Reply to this message to book your slot."
            },
            {
                dayOffset: 5,
                content: "Hi {{first_name}}, this is our final follow-up regarding your cancelled appointment. Please reply or give us a call — we'll make it easy to get back on the calendar."
            }
        ]
    }
];

// Initialize templates if they don't exist
export const initializeCampaigns = () => {
    if (campaignStore.count() === 0) {
        DEFAULT_CAMPAIGNS.forEach(c => campaignStore.upsert(c));
    }
};
