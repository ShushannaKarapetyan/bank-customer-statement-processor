export interface IParsedXMLRecord {
    $: { reference: string };
    accountNumber: string;
    description: string;
    startBalance: string;
    mutation: string;
    endBalance: string;
}