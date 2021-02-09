import { Account, Book, Transaction } from "bkper";
import { EventHandlerTransaction } from "./EventHandlerTransaction";

export class EventHandlerTransactionChecked extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected async connectedTransactionFound(baseBook: Book, connectedBook: Book, baseTransaction: bkper.Transaction, connectedTransaction: Transaction): Promise<string> {
    if (connectedTransaction.isPosted() && !connectedTransaction.isChecked()) {
      await connectedTransaction.check();
      return await this.buildFoundResponse(connectedBook, connectedTransaction);
    } else if (!connectedTransaction.isPosted() && await this.isReadyToPost(connectedTransaction)) {
      await connectedTransaction.post();
      await connectedTransaction.check();
      return await this.buildFoundResponse(connectedBook, connectedTransaction);
    } else {
      return await this.buildFoundResponse(connectedBook, connectedTransaction);
    }
  }

  private async buildFoundResponse(connectedBook: Book, connectedTransaction: Transaction): Promise<string> {
    let bookAnchor = super.buildBookAnchor(connectedBook);
    let amountFormatted = connectedBook.formatValue(connectedTransaction.getAmount());
    let record = `CHECKED: ${connectedTransaction.getDateFormatted()} ${amountFormatted} ${await connectedTransaction.getCreditAccountName()} ${await connectedTransaction.getDebitAccountName()} ${connectedTransaction.getDescription()}`;
    return `${bookAnchor}: ${record}`;
  }


  protected async connectedTransactionNotFound(baseBook: Book, connectedBook: Book, baseTransaction: bkper.Transaction): Promise<string> {
    let childCreditAccount = await baseBook.getAccount(baseTransaction.creditAccount.id);
    let childDebitAccount = await baseBook.getAccount(baseTransaction.debitAccount.id);
    let parentBookAnchor = super.buildBookAnchor(connectedBook);

    let parentCreditAccount = await this.getParentAccount(connectedBook, childCreditAccount);
    let parentDebitAccount = await this.getParentAccount(connectedBook, childDebitAccount);


    let newTransaction = connectedBook.newTransaction()
      .setDate(baseTransaction.date)
      .setProperties(baseTransaction.properties)
      .setAmount(baseTransaction.amount)
      .setCreditAccount(parentCreditAccount)
      .setDebitAccount(parentDebitAccount)
      .setDescription(baseTransaction.description)
      .addRemoteId(baseTransaction.id);

    let record = `${newTransaction.getDate()} ${newTransaction.getAmount()} ${parentCreditAccount ? parentCreditAccount.getName() : ''} ${parentDebitAccount ? parentDebitAccount.getName() : ''} ${newTransaction.getDescription()}`;

    if (await this.isReadyToPost(newTransaction)) {
      await newTransaction.post();
      await newTransaction.check();
    } else {
      newTransaction.setDescription(`${newTransaction.getCreditAccount() == null ? parentCreditAccount.getName() : ''} ${newTransaction.getDebitAccount() == null ? parentDebitAccount.getName() : ''} ${newTransaction.getDescription()}`.trim())
      await newTransaction.create();
    }

    return `${parentBookAnchor}: ${record}`;
  }

}