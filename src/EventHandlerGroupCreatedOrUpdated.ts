import { Account, Book, Group } from "bkper";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupCreatedOrUpdated extends EventHandlerGroup {

  protected async childGroupNotFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group): Promise<string> {
    console.log(`CREATE: ${parentGroup.name}`)
    let childGroup = await childBook.newGroup()
      .setName(parentGroup.name)
      .setProperties(parentGroup.properties)
      .create();
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD GROUP ${childGroup.getName()} CREATED`;
  }
  
  protected async childGroupFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group, childGroup: Group): Promise<string> {
    console.log(`UPDATE: ${parentGroup.name}`)
    await childGroup
      .setName(parentGroup.name)
      .setProperties(parentGroup.properties)
      .update();
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD GROUP ${childGroup.getName()} UPDATED`;
  }

}