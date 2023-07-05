export enum LoginErrorStatus {
    UNDEFINED, // Unknown error has occured
    UNHANDABLE, // No handler for current state
    ACTION_REQUIRED, // Manual action is required from the user to fix an issue
    REJECTED, // Rejected current login attempt
    INVALID_REQUEST, // Invalid input
    SESSION_EXPIRED, // Page session has expired
    GOOGLE_API, // An error has occured with Google
    NO_SUPPORTED_VERIFICATION // Only available method of verification is by an unsupported method
}