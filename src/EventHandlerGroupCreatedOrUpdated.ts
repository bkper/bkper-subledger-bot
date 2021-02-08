import { Account, Book, Group } from "bkper";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupCreatedOrUpdated extends EventHandlerGroup {
  protected async parentGroupNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string> {
    console.log(`CREATE: ${childGroup.name}`)
    let parentGroup = await parentBook.newGroup()
      .setName(childGroup.name)
      .setProperties(childGroup.properties)
      .create();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: GROUP ${parentGroup.getName()} CREATED`;
  }
  protected async parentGroupFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentGroup: Group): Promise<string> {
    console.log(`UPDATE: ${childGroup.name}`)
    await parentGroup
      .setName(childGroup.name)
      .setProperties(childGroup.properties)
      .update();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: GROUP ${parentGroup.getName()} UPDATED`;
  }

}