export type FeedbackType = "new_feature" | "bug"

export default interface Feedback {
    id: string
    type: FeedbackType
    note: string
    submitted_by: string
    created_at: string
    updated_at: string
}
