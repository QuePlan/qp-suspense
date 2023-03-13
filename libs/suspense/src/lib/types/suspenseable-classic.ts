import { ObservableInput } from "rxjs";
import { ISuspenseable, SuspenseableRenderer } from "./types";

export abstract class SuspenseableClassic extends SuspenseableRenderer implements Pick<ISuspenseable, 'setup'> {
  abstract setup(): ObservableInput<any>;
}