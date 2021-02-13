import { Account, Book, Transaction } from "bkper";
import { EventHandlerTransaction } from "./EventHandlerTransaction";

export class EventHandlerTransactionChecked extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected async parentTransactionFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string> {
    if (parentTransaction.isPosted() && !parentTransaction.isChecked()) {
      await parentTransaction.check();
      return await this.buildFoundResponse(parentBook, parentTransaction);
    } else if (!parentTransaction.isPosted() && await this.isReadyToPost(parentTransaction)) {
      await parentTransaction.post();
      await parentTransaction.check();
      return await this.buildFoundResponse(parentBook, parentTransaction);
    } else {
      return await this.buildFoundResponse(parentBook, parentTransaction);
    }
  }

  private async buildFoundResponse(connectedBook: Book, connectedTransaction: Transaction): Promise<string> {
    let bookAnchor = super.buildBookAnchor(connectedBook);
    let amountFormatted = connectedBook.formatValue(connectedTransaction.getAmount());
    let record = `CHECKED: ${connectedTransaction.getDateFormatted()} ${amountFormatted} ${await connectedTransaction.getCreditAccountName()} ${await connectedTransaction.getDebitAccountName()} ${connectedTransaction.getDescription()}`;
    return `${bookAnchor}: ${record}`;
  }


  protected async parentTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string> {
    let childCreditAccount = await childBook.getAccount(childTransaction.creditAccount.id);
    let childDebitAccount = await childBook.getAccount(childTransaction.debitAccount.id);
    let parentBookAnchor = super.buildBookAnchor(parentBook);

    let parentCreditAccount = await this.getParentAccount(parentBook, childCreditAccount);
    let parentDebitAccount = await this.getParentAccount(parentBook, childDebitAccount);


    let parentTransaction = parentBook.newTransaction()
      .setDate(childTransaction.date)
      .setProperties(childTransaction.properties)
      .setAmount(childTransaction.amount)
      .setCreditAccount(parentCreditAccount)
      .setDebitAccount(parentDebitAccount)
      .setDescription(childTransaction.description)
      .addRemoteId(childTransaction.id);

    let record = `${parentTransaction.getDate()} ${parentTransaction.getAmount()} ${parentCreditAccount ? parentCreditAccount.getName() : ''} ${parentDebitAccount ? parentDebitAccount.getName() : ''} ${parentTransaction.getDescription()}`;

    if (await this.isReadyToPost(parentTransaction)) {
      await parentTransaction.post();
      await parentTransaction.check();
    } else {
      parentTransaction.setDescription(`${parentTransaction.getCreditAccount() == null ? parentCreditAccount.getName() : ''} ${parentTransaction.getDebitAccount() == null ? parentDebitAccount.getName() : ''} ${parentTransaction.getDescription()}`.trim())
      await parentTransaction.create();
    }

    return `${parentBookAnchor}: ${record}`;
  }

}