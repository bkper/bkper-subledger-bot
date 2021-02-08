import { Account, Book, Group } from "bkper";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupDeleted extends EventHandlerGroup {
  protected async parentGroupNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: GROUP ${childGroup.name} NOT Found`;
  }
  protected async parentGroupFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentGroup: Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    await parentGroup.remove();
    return `${bookAnchor}: ACCOUNT ${parentGroup.getName()} DELETED`;
  }

}