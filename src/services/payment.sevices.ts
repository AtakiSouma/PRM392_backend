import moment from 'moment'
import * as crypto from 'crypto'
import * as qs from 'qs'
import * as CryptoJS from 'crypto-js'
import axios from 'axios'
import { Request } from 'express'
import { pid } from 'process'
import prisma from '~/libs/prisma'
const config = {
  app_id: process.env.ZALOPAY_APP_ID || '2554',
  key1: process.env.ZALOPAY_KEY1 || 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  key2: process.env.ZALOPAY_KEY2 || 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  endpoint: process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create'
}
interface CallbackResult {
  returncode: number
  returnmessage: string
}

class paymentService {
  public async createPayment(order_data: any, price: number) {
    const embed_data = {
      merchantinfo: 'embeddata123',
      redirecturl: 'http://localhost:8080/api/'
    }
    const items = [order_data]
    const transID = Math.floor(Math.random() * 1000000)
    
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: 'Shop Ecommerce',
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: price,
      description: `FueverFriend- Petcare - Payment for the booking #${transID}`,
      bank_code: '',
      callback_url: 'http://192.168.1.7:8080/api/v1/payment/callback',
      mac: ''
    }
    const data =
      config.app_id +
      '|' +
      order.app_trans_id +
      '|' +
      order.app_user +
      '|' +
      order.amount +
      '|' +
      order.app_time +
      '|' +
      order.embed_data +
      '|' +
      order.item
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString()
    try {
      const result = await axios.post(config.endpoint, null, { params: order })
      console.log('result', result.data)
      return result.data
    } catch (error) {
      console.log(error)
      throw new Error('Failed to create payment order')
    }
  }

  public async callBackZaloPay(req: Request) {
    const result: CallbackResult = {
      returncode: 0,
      returnmessage: ''
    }
    try {
      const dataStr = req.body.data
      const reqMac = req.body.mac
      const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString()
      console.log('mac =', mac)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.returncode = -1
        result.returnmessage = 'mac not equal'
      } else {
        const dataJson = JSON.parse(dataStr)
        // update status
        console.log('dataJson =', dataJson)
        // Extract id and status_string
        const items = JSON.parse(dataJson.item)
        const itemId = items[0].id
        await prisma.order.update({
          data: {
            status: 'Successfully'
          },
          where: { id: itemId }
        })
        result.returncode = 1
        result.returnmessage = 'success'
      }
    } catch (error) {
      result.returncode = 0 // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.returnmessage = 'success'
    }
    return result
  }

  public async checkStatusOrder(req: Request) {
    const { app_trans_id } = req.body
    const postData = {
      app_id: config.app_id,
      app_trans_id,
      mac: ''
    }
    const data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1 // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString()

    console.log('post Data', postData)

    const postConfig = {
      method: 'post',
      url: 'https://sb-openapi.zalopay.vn/v2/query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify(postData)
    }
    try {
      const result = await axios(postConfig)
      console.log(result.data)
      return result.data
      /**
     * kết quả mẫu
      {
        "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
        "return_message": "",
        "sub_return_code": 1,
        "sub_return_message": "",
        "is_processing": false,
        "amount": 50000,
        "zp_trans_id": 240331000000175,
        "server_time": 1711857138483,
        "discount_amount": 0
      }
    */
    } catch (error) {
      console.log('lỗi')
      console.log(error)
    }
  }
}

export default new paymentService()
