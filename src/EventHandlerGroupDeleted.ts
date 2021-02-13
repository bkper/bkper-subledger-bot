import { Account, Book, Group } from "bkper";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupDeleted extends EventHandlerGroup {
  protected async childGroupNotFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD GROUP ${parentGroup.name} NOT Found`;
  }
  protected async childGroupFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group, childGroup: Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(childBook);
    await childGroup.remove();
    return `${bookAnchor}: CHILD GROUP ${childGroup.getName()} DELETED`;
  }

}