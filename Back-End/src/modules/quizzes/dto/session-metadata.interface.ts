/**
 * Shape of the `metadata` JSONB column on quiz_sessions.
 *
 * Maintained entirely on the client side and persisted as an opaque snapshot
 * on every suspend/complete call.  The server never interprets or validates
 * the individual arrays – it just stores and returns them.
 *
 * Fields
 * ------
 * answered           – IDs of questions the user has submitted an answer for
 * unanswered         – IDs the user opened but left blank / skipped
 * unseen             – IDs not yet visited in this session
 * marked             – IDs the user flagged for later review
 * current_question_id – the question the user was on when they suspended
 */
export interface SessionMetadata {
  answered?: number[];
  unanswered?: number[];
  unseen?: number[];
  marked?: number[];
  current_question_id?: number;
}
