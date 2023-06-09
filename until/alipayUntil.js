const AlipaySdk = require('alipay-sdk').default
// signType: 'RSA2', // 签名种类
const alipaySdk = new AlipaySdk({
  // AppId
  appId: "2021000122672980",
  // 签名算法
  signType: "RSA2",
  // 支付宝网关
  gateway: "https://openapi.alipaydev.com/gateway.do",
  // 支付宝公钥
  alipayPublicKey:"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtvWGZ5zPFkeOBt35RbZAasprlkiP736xN+ixx8yud9BEQI2fp/vwkHznnc6QIr+qYKye8UimMVLB7wu+YEeTKUTtKvRBcP0TkbLtfLMkKGnWQYPw83pImkHcFYdARbMiArnXhP2TBTRFHGaeK2rne0St19l8bNThnSaziEFqiyXzERf6mYmBtRY4Bzm55ZvPzLXEMs+0nveiFlsi718nsszwdYsJC02N3Heo+G7bMY/cJExdbsvc99mS99uiowk60aey4T7LPw6C9I/tkozSXeTQvO4O5A2+wHSGoOWtR0JrvHql50ARSuDXihcyWRgomflCwWoUC0WTyq8l11k7twIDAQAB",
  // 应用私钥
  privateKey:"MIIEowIBAAKCAQEAjQNztoa4IT0kGPnDRW4JjxETPOInPXcFV4Zaex2IZfs05P+3xyss9TKTB6RboM2nmG+KW7ocNbwJCOf9uWBXhpMOUdDYNuOcdvDMZr8dcMPJftpCl8+U22eKvAR4onjQD1W7o+bANqedK9HsbGlRCEl9hxynqzSSSMHgw2hs3CUaEXLjWZj7luqBLyT9KSvv2tbLe+ldFm4zfq5Oq/ZyW0nlPUIIxeXDVX4v8abXxez5JVvFFe+8xbryKyoUXQlnLBtWXAZ8dAvq6gmjplInhWprCHDe6oqJ643+qq92KU5Mbx9nE4dNSjtWkXUnDuWfKjlvnxhaeRl9Mxloy+FaGQIDAQABAoIBAGQX2i/qipKVaqULzI7g34oczbH+uWnIrRMGe/095k61NEOEPDf0rrHRV0oqYRvQPrFWIzie7104/pTCz3ehKh+NDLIIcyDrCWnn3L7l04jygHk5heFqaDgg0/pHljWFWfI4obtilHd3HHo5RP9i9jDSsXaRYXaGF3vrmpY57mOIIpStYM1kJuW7D3reXuXI2sddN4bNkl/gD0epaWU8gESrQ8pevsHboqgrb+piSM23bN2g+qwulbr7DWIvWipjUuiTzPuG0/V2DszTsQdxc4W5g+b7XUzG7nbSJM7l04bi3Ee/7PxrvGsWkVmXO8bIx4/wJOhJCBkulJVClMj47b0CgYEA6vhGjQVJo9TZfAlBgUEWKAVh+zuhKoOEO5uzCj6vEEx8AmyJB57EYg7xSqdv1CRySw1WRcH190m47QVdsSOFA+AQUGb3suZ8AI1g/za8aK7ewZtCMy7QTWrWWZ7IEe3RcDvHW6m+jQ0Yzhdp+dixoho/Bv1KtFzgM5dbvUVf5RsCgYEAmaJpES2lLGqEeBTKjPW9XT9/ABheBwlDBko0k5jIGTILGEIZxVM1UgtDwMy1n6T6WtvVqZuQf0AYtodWV/SoyK/tKmy4BE7rg3tKvkW26bp9ivgtyIT27zwYc8hC7aAC4H1ZTmagfa3wJkn/hkNkGbgAU0+BHsmDdyoEknM61NsCgYEAnbpl2Zo4EaL7DzlDYJmpXtomKLihemFobX8aE4F6kM1W3WWwIo5gM5bmQH/fIKAKnPjp9c+65fH2Eh1tBFDcpHpPWTmVguEXUmOVPhynIvpoC7zGFoeRSrayBt0AXpCu69ElBRIQGK02/nlXKWFd9Hv73RxAfoxt8BPlgEtGkQsCgYBPmKdasQ1cX6tWE1+FfGOphhYkVHuSpafGAHgQ6BzzgMviu4xigWOkqBVoNCb9GRpkLHUcNG6+ntSu7Js9YpJ3tz3mtwD3qnO2YRAuWCwWF/qnH0GJG+pbtATvJ5gVSMt0xzyXs+/+bTl4fOoYA54+/OeeQhihfMHR4UERJwYZ9QKBgCh50QXJFR6JdUkxYAVRc2DTA1uiMitSzTq8YEbp+XQrhTG2SHo8pgrNYnSnO4I8zi0t8UEZoD3oDJcKyLQkxdoLt/uPoQaUkHJF9CsyIKcbU3pg55l04HV5dZyySQZw/I1QmGYcP8uDJm9ZAjmh0klVZIEFqXdTG5K1vVC9LIRa"
})
module.exports = alipaySdk