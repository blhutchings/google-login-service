import { AbstractActionHandler, ActionHandler } from "./AbstractActionHandler";

export default abstract class AbstractVerificationHandler<T extends ActionHandler> extends AbstractActionHandler<T> {
    abstract type: number;
}