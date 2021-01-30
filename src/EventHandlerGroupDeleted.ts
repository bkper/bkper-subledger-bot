import { Account, Book, Group } from "bkper";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupDeleted extends EventHandlerGroup {
  protected async parentAccountNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: ACCOUNT ${childGroup.name} NOT Found`;
  }
  protected async parentAccountFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentAccount: Account): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    if (parentAccount.hasTransactionPosted()) {
      await parentAccount.remove();
      return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} DELETED`;
    } else {
      await parentAccount.setArchived(true).update();
      return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} ARCHIVED`;
    }
  }

}