import { Account, Book, Transaction } from "bkper-js";
import { CHILD_FROM_PROP, CHILD_TO_PROP } from "./constants.js";
import { EventHandlerTransaction } from "./EventHandlerTransaction.js";

export class EventHandlerTransactionPosted extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected async parentTransactionFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string> {
    if (!parentTransaction.isPosted() && await this.isReadyToPost(parentTransaction)) {
      await parentTransaction.post();
      return await this.buildFoundResponse(parentBook, parentTransaction);
    }
    return null;
  }

  private async buildFoundResponse(childBook: Book, parentTransaction: Transaction): Promise<string> {
    let bookAnchor = super.buildBookAnchor(childBook);
    let amountFormatted = childBook.formatValue(parentTransaction.getAmount());
    let record = `POSTED: ${parentTransaction.getDateFormatted()} ${amountFormatted} ${await parentTransaction.getCreditAccountName()} ${await parentTransaction.getDebitAccountName()} ${parentTransaction.getDescription()}`;
    return `${bookAnchor}: ${record}`;
  }


  protected async parentTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string> {
    let childCreditAccount = await childBook.getAccount(childTransaction.creditAccount.id);
    let childDebitAccount = await childBook.getAccount(childTransaction.debitAccount.id);
    let parentBookAnchor = super.buildBookAnchor(parentBook);

    let parentCreditAccount = await this.getParentAccount(childBook, parentBook, childCreditAccount);
    let parentDebitAccount = await this.getParentAccount(childBook, parentBook, childDebitAccount);

    let amount = this.getAmount(parentBook, childTransaction);
    if (amount == null) {
      return null;
    }

    let parentTransaction = parentBook.newTransaction()
      .setDate(childTransaction.date)
      .setProperties(childTransaction.properties)
      .setProperty(CHILD_FROM_PROP, childCreditAccount.getName())
      .setProperty(CHILD_TO_PROP, childDebitAccount.getName())      
      .setAmount(amount)
      .setCreditAccount(parentCreditAccount)
      .setDebitAccount(parentDebitAccount)
      .setDescription(childTransaction.description)
      .addRemoteId(childTransaction.id);

      let record = `${parentTransaction.getDate()} ${parentTransaction.getAmount()} ${parentCreditAccount ? parentCreditAccount.getName() : ''} ${parentDebitAccount ? parentDebitAccount.getName() : ''} ${parentTransaction.getDescription()}`;

    if (await this.isReadyToPost(parentTransaction)) {
      await parentTransaction.post();
    } else {
      parentTransaction.setDescription(`${parentTransaction.getCreditAccount() == null ? parentCreditAccount.getName() : ''} ${parentTransaction.getDebitAccount() == null ? parentDebitAccount.getName() : ''} ${parentTransaction.getDescription()}`.trim())
      await parentTransaction.create();
    }

    return `${parentBookAnchor}: ${record}`;
  }


}