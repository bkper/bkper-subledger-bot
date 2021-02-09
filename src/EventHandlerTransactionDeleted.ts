import { Book, Transaction } from "bkper";
import { EventHandlerTransaction } from "./EventHandlerTransaction";

export class EventHandlerTransactionDeleted extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected connectedTransactionNotFound(baseBook: Book, connectedBook: Book, baseTransaction: bkper.Transaction): Promise<string> {
    return null;
  }
  protected async connectedTransactionFound(baseBook: Book, connectedBook: Book, baseTransaction: bkper.Transaction, connectedTransaction: Transaction): Promise<string> {
    let bookAnchor = super.buildBookAnchor(connectedBook);

    if (connectedTransaction.isChecked()) {
      await connectedTransaction.uncheck();
    }

    await connectedTransaction.remove();

    let amountFormatted = connectedBook.formatValue(connectedTransaction.getAmount())

    let record = `DELETED: ${connectedTransaction.getDateFormatted()} ${amountFormatted} ${await connectedTransaction.getCreditAccountName()} ${await connectedTransaction.getDebitAccountName()} ${connectedTransaction.getDescription()}`;

    return `${bookAnchor}: ${record}`;
  }

}
