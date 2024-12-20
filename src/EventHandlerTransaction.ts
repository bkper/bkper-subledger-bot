import { Account, AccountType, Amount, Book, Group, Transaction } from "bkper-js";
import { PARENT_ACCOUNT_PROP, PARENT_AMOUNT } from "./constants.js";
import { EventHandler } from "./EventHandler.js";

export interface AmountDescription {
  amount: Amount;
  description: string;
  taxAmount: Amount;
}

export abstract class EventHandlerTransaction extends EventHandler {

  processParentBookEvent(parentBook: Book, event: bkper.Event): Promise<string> {
    return null;
  }

  // child >> parent
  async processChildBookEvent(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string> {

    let operation = event.data.object as bkper.TransactionOperation;
    let baseTransaction = operation.transaction;

    if (baseTransaction.agentId == 'exchange-bot') {
      console.log("Skiping Exchange Bot agent.");
      return null;
    } 

    if (!baseTransaction.posted) {
      return null;
    }

    let connectedTransaction = (await parentBook.listTransactions(this.getTransactionQuery(baseTransaction))).getFirst();
    if (connectedTransaction) {
      return this.parentTransactionFound(childBook, parentBook, baseTransaction, connectedTransaction);
    } else {
      return this.parentTransactionNotFound(childBook, parentBook, baseTransaction);
    }
  }

  protected async getParentAccount(childBook: Book, parentBook: Book, childAccount: Account): Promise<Account> {

    // If the parent_account property is set directly on the child account, use it to find the parent account
    if (childAccount.getProperty(PARENT_ACCOUNT_PROP)) {
      const parentAccountName = childAccount.getProperty(PARENT_ACCOUNT_PROP);
      const parentAccount = await parentBook.getAccount(parentAccountName);
      return parentAccount;
    }

    const childGroups = await childAccount.getGroups();

    for (const childGroup of childGroups) {
      let parentAccountName = childGroup.getProperty(PARENT_ACCOUNT_PROP);
      if (parentAccountName) {
        let parentAccount = await parentBook.getAccount(parentAccountName);
        if (parentAccount == null) {
          try {
            parentAccount = await new Account(parentBook)
              .setName(parentAccountName)
              .setType(childGroup.getType())
              .create()
          } catch (err) {
            console.log(err)
            return null;
          }
        }

        return parentAccount;
      }
      
      const linkedParentGroup = await this.getLinkedParentGroup(childBook, parentBook, childGroup);

      if (linkedParentGroup) {
        let parentAccountName = childAccount.getName();
        let parentAccount = await parentBook.getAccount(parentAccountName);
        return parentAccount;
      }
    }

    //Falback for account with same name as child
    return await parentBook.getAccount(childAccount.getName());
  }

  protected async isReadyToPost(newTransaction: Transaction) {
    return await newTransaction.getCreditAccount() != null && await newTransaction.getDebitAccount() != null && newTransaction.getAmount() != null;
  }

  protected getAmount(parentBook: Book, childTransaction: bkper.Transaction): Amount {
    let parentAmountProp = childTransaction.properties[PARENT_AMOUNT];
    if (parentAmountProp) {
      let parentAmount = parentBook.parseValue(parentAmountProp);
      if (!parentAmount || parentAmount.eq('0')) {
        return null;
      } else {
        return parentAmount;
      }
    } else {
      return new Amount(childTransaction.amount);
    }
  }

  protected abstract getTransactionQuery(childTransaction: bkper.Transaction): string;

  protected abstract parentTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string>;

  protected abstract parentTransactionFound(childBook: Book, parentBook: Book, chilTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string>;
}