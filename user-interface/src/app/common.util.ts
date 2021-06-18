import Web3 from 'web3';
export class CommonUtil {

    private static readonly formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'code'
      });


    public static roundPad2(value): string{
        return String(Math.round(value)).padStart(2, '0');
    }

    public static formatAmount(value): string {
        return this.formatter.format(value).substring(4);
    }

    public static getNumber(value) {
        const fromWeiValue = Web3.utils.fromWei(value);
        const num = Number(fromWeiValue);
        return Math.round(num * 100) / 100;
    }

}

