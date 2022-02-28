/**
 * axios 0.24.0 ts封装
 */
import axios, { AxiosError, AxiosPromise, AxiosResponse } from 'axios'
import TokenHelper from '../token'
import { UserLoginResponse } from '../interfaces/user'

/** 个人登录的响应数据结构 */
export interface UserLoginResponse {
  accessToken: string
  refreshToken?: string
}

/** 枚举:常用请求方式 */
export enum EnumMethods {
  GET = 'GET',
  POST = 'POST',
  OPTIONS = 'OPTIONS',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

/**
 * 响应格式统一
 * code: 返回的状态码: 0 代表响应成功, >0 则代表对应业务的错误状态码；
 * success: true(响应成功), false(响应业务异常)；
 * data: T 或 空string
 * message: ok(响应成功) 或 异常信息
 * request: "请求方法 请求路径"
 */
export interface ResponseType<T> {
  code: number
  data: T | ''
  success: boolean
  message: string
  request: string
}

/** 前端自定义异常消息 */
export const frontErrorMessage: Record<number, string> = {
  999: '服务器未知异常',
  401000: '登录失败',
  401001: '账号或密码错误',
  404000: '资源不存在',
  403002: '令牌已过期',
  403001: '令牌不合法,不能操作',
  403011: 'refressToken不合法',
  403012: 'refressToken已过期'
}

const service = axios.create({
  baseURL: String(import.meta.env.VITE_APP_BASE_URL) || '',
  timeout: Number(import.meta.env.VITE_APP_TIME_OUT) || 5000, // 请求超时时间设置
  validateStatus (status: number) {
    return status >= 200 && status < 510
  }
})

/** 判断是否为refresh_token刷新access_token时出现的异常 */
function errorByRefreshTokenExeption (code: number) {
  // 从配置中读取
  // 根据配合后端制定特定code
  const codes: Array<number> = [403039]
  return codes.includes(code)
}

/** 判断是否为access_token过期异常 */
function errorByAcceTokenExpireInException (code: number) {
  // 从配置中读取
  // 根据配合后端制定特定code
  const codes: Array<number> = [403000]
  return codes.includes(code)
}

// cache 用于过滤 重发请求仍然得到令牌过期响应,造成不断重复触发重发
const AcceTokenExpireInCache = <{ url: string | undefined }>{}
// 刷新令牌的api
const CONST_REFRESH_TOKEN_URL = "/cms/user/refresh"
// 双令牌是否自动续签: false 默认只刷新access_token; true 刷新时access_token和reflesh_token都刷新
const CONST_SYS_TOKEN_AUTOMATIC_RENEWAL = false
// 是否使用前端定义的错误信息: false 默认,不使用<默认使用后端错误信息> true 使用前端信息
const CONST_SYS_USE_CLIENT_ERROR_MESSAGE = false


// 请求拦截器
service.interceptors.request.use(
  async (config: any) => {
    // 是否手动处理token失效
    // if (
    //   AuthManualTokenExpireIn.isOpenManua &&
    //   AuthManualTokenExpireIn.checkTokenIsExpireIn()
    // ) {
    //   // 过期了，直接登出
    //   // useUserStore().logout()
    //   return Promise.reject(null)
    // }

    const originConfig = { ...config }

    if (!originConfig.url) {
      console.error('想发送请求, 却没有传请求地址.')
    }

    // 请求method转大写,单独使用service<axios>时,需要做处理
    originConfig.method = originConfig.method.toUpperCase()

    // get、post、formdata的参数容错处理
    switch (originConfig.method) {
      case EnumMethods.GET:
        if (!originConfig.params) {
          // 参数放在data里了
          originConfig.params = originConfig.data || {}
        }
        break
      case EnumMethods.POST:
        if (!originConfig.data) {
          // 参数放在params里了
          originConfig.data = originConfig.params || {}
        }

        // 第一层属性-检测是否包含文件类型
        let hasFile = false
        Object.keys(originConfig.data).forEach((key) => {
          if (typeof originConfig.data[key] === 'object') {
            const item = originConfig.data[key]
            if (
              item instanceof FileList ||
              item instanceof File ||
              item instanceof Blob
            ) {
              hasFile = true
            }
          }
        })
        // 检测到存在文件使用 FormData 提交数据
        if (hasFile) {
          const formData = new FormData()
          Object.keys(originConfig.data).forEach((key) => {
            formData.append(key, originConfig.data[key])
          })
          originConfig.data = formData
        }
        break
    }

    // 处理令牌刷新的请求-将refresh_token放headers里面
    if (originConfig.url === CONST_REFRESH_TOKEN_URL) {
      const refreshToken = TokenHelper.getRefreshToken()
      if (refreshToken) {
        originConfig.headers.Authorization = `Bearer ${refreshToken}`
      }
    } else {
      const accessToken = TokenHelper.getAccessToken()
      originConfig.headers.Authorization = `Bearer ${accessToken}`
    }

    return originConfig
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ResponseType<any>, any>) => {
    // 2xx
    if (String(response.status).charAt(0) === '2') {
      return Promise.resolve(response.data)
    }

    const { code, message } = response.data
    return new Promise(async (resolve, rejects) => {
      // 业务异常处理 4xx 5xx 状态码+错误码-统一处理: 弹窗...
      // const userStore = useUserStore()
      const { url } = response.config

      // refresh_token刷新业务操作失败,直接退出登录
      if (errorByRefreshTokenExeption(code)) {
        // ElMessage.error('服务升级完成, 稍后请重新登录')
        alert('服务升级完成, 稍后请重新登录')
        setTimeout(() => {
          userStore.logout()
        }, 2000)
        return resolve(null)
      }

      // access_token失效,尝试刷新令牌
      if (errorByAcceTokenExpireInException(code)) {
        if (AcceTokenExpireInCache.url !== url) {
          AcceTokenExpireInCache.url = url
          const tokenResult = await service.get<UserLoginResponse>(
            CONST_REFRESH_TOKEN_URL
          )
          // 是否启用了双令牌刷新
          if (CONST_SYS_TOKEN_AUTOMATIC_RENEWAL()) {
            TokenHelper.saveToken(
              tokenResult.data.accessToken,
              tokenResult.data.accessToken
            )
          } else {
            // 只刷新accessToken
            TokenHelper.saveAccessToken(tokenResult.data.accessToken)
          }
          // 将上次失败请求重发
          const result = await service(response.config)
          return resolve(result)
        } else {
          // 重发,仍得到过期响应? 那就删除缓存,回到登录页
          setTimeout(() => {
            AcceTokenExpireInCache.url = undefined
            userStore.logout()
          }, 2000)
        }
      }

      // 错误提示信息
      let tipMessage = ''
      const isOpenClientMessage = CONST_SYS_USE_CLIENT_ERROR_MESSAGE()
      if (isOpenClientMessage) {
        // 开启客户端异常消息
        tipMessage = FrontErrorMessage[code] || ''
      } else {
        tipMessage = message
      }

      tipMessage && console.error(tipMessage)
      rejects(response)
    })
  },
  (error: AxiosError) => {
    if (!error.response) {
      // ElMessage.error('请检查 API 是否异常')
      console.error('请检查 API 是否异常')
    }

    // 判断请求超时
    if (
      error.code === 'ECONNABORTED' &&
      error.message.indexOf('timeout') !== -1
    ) {
      // ElMessage.error('请求超时')
      console.error('请求超时')
    }

    return Promise.reject(error)
  }
)

/**
 * get
 * @param url 请求地址
 * @param params query参数对象: key-value
 * @returns Promise
 */
function get<T> (url: string, params?: Record<string, any>): AxiosPromise<T> {
  return service({
    method: 'GET',
    url,
    params
  })
}

/**
 * post
 * @param url 请求地址
 * @param data body参数, key-value
 * @returns Promise
 */
function post<T> (url: string, data?: Record<string, any>): AxiosPromise<T> {
  return service({
    method: 'POST',
    url,
    data
  })
}

/**
 * put
 * @param url 请求地址
 * @param data body参数对象, key-value
 * @returns Promise
 */
function put<T> (url: string, data?: Record<string, any>): AxiosPromise<T> {
  return service({
    method: 'PUT',
    url,
    data
  })
}

/**
 * _delete 删除资源,无响应结果
 * 可使用post来设计资源删除,令请求有返回结果
 * @param url 请求地址
 * @returns Promise
 */
function _delete (url: string) {
  return service({
    method: 'DELETE',
    url
  })
}

export { get, post, put, _delete }
export default service
