import requests
from countryinfo import CountryInfo


response = requests.get("https://api.freecurrencyapi.com/v1/latest?apikey=CgEOWBd1EiC5ux0RqxXDRml6xpKh31hCYJliaZzD&currencies=EUR%2CUSD%2CJPY%2CBGN%2CCZK%2CDKK%2CGBP%2CHUF%2CPLN%2CRON%2CSEK%2CCHF%2CISK%2CNOK%2CHRK%2CRUB%2CTRY%2CAUD%2CBRL%2CCAD%2CCNY%2CHKD%2CIDR%2CILS%2CINR%2CKRW%2CMXN%2CMYR%2CNZD%2CPHP%2CSGD%2CTHB%2CZAR&base_currency=CAD")
currencydata = (response.json())['data']

def currencyConversion(source_country, target_country, amount, currencydata):
    source_currency = CountryInfo(source_country).currencies()[0]
    target_currency = CountryInfo(target_country).currencies()[0]
    source_rate = float(currencydata[source_currency])
    target_rate = float(currencydata[target_currency])
    if source_rate is None or target_rate is None:
        return None
    converted_amount = (amount / source_rate) * target_rate
    return round(converted_amount,2)