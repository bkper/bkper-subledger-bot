import { Account, Book, Group } from "bkper";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupDeleted extends EventHandlerGroup {
  protected async connectedGroupNotFound(baseBook: Book, connectedBook: Book, baseGroup: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(connectedBook);
    return `${bookAnchor}: GROUP ${baseGroup.name} NOT Found`;
  }
  protected async connectedGroupFound(baseBook: Book, connectedBook: Book, baseGroup: bkper.Group, connectedGroup: Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(connectedBook);
    await connectedGroup.remove();
    return `${bookAnchor}: ACCOUNT ${connectedGroup.getName()} DELETED`;
  }

}