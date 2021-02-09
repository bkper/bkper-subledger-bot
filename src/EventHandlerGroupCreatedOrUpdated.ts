import { Account, Book, Group } from "bkper";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupCreatedOrUpdated extends EventHandlerGroup {
  protected async connectedGroupNotFound(baseBook: Book, connectedBook: Book, baseGroup: bkper.Group): Promise<string> {
    console.log(`CREATE: ${baseGroup.name}`)
    let parentGroup = await connectedBook.newGroup()
      .setName(baseGroup.name)
      .setProperties(baseGroup.properties)
      .create();
    let bookAnchor = super.buildBookAnchor(connectedBook);
    return `${bookAnchor}: GROUP ${parentGroup.getName()} CREATED`;
  }
  protected async connectedGroupFound(baseBook: Book, connectedBook: Book, baseGroup: bkper.Group, connectedGroup: Group): Promise<string> {
    console.log(`UPDATE: ${baseGroup.name}`)
    await connectedGroup
      .setName(baseGroup.name)
      .setProperties(baseGroup.properties)
      .update();
    let bookAnchor = super.buildBookAnchor(connectedBook);
    return `${bookAnchor}: GROUP ${connectedGroup.getName()} UPDATED`;
  }

}