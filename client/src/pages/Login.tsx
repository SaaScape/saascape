import { Button, Card, Form, Input } from "antd"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { authAxios } from "../helpers/axios"
import { initializeUser } from "../store/slices/userSlice"

interface IProps {
  setIsAuthenticated: Function
  checkedAuth: boolean
}

const Login = (props: IProps) => {
  const { setIsAuthenticated } = props
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch()

  const onFormFinish = async (values: any) => {
    setLoading(true)
    try {
      const {
        data: {
          success,
          data: { userAccount, refreshToken, permissions },
        },
      } = await authAxios.post("/login", values)

      if (success) {
        localStorage.setItem("refreshToken", refreshToken)
        const obj = { ...userAccount, permissions }
        dispatch(initializeUser(obj))
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.warn(err)
    }

    setLoading(false)
  }

  return (
    <section className='page login'>
      <div className='background-cover'>
        <div className='main-grid'>
          <div className='top'>
            <h1>SaaScape</h1>
          </div>
          <div className='main d-flex justify-center align-center'>
            <Card className='login-card'>
              <div className='title'>Login</div>

              <Form
                layout='vertical'
                onFinish={onFormFinish}
                className='login-form'
              >
                <Form.Item
                  label='Email Address'
                  name={"username"}
                  required
                  rules={[{ required: true }]}
                >
                  <Input readOnly={loading} />
                </Form.Item>
                <Form.Item
                  label='Password'
                  required
                  name={"password"}
                  rules={[{ required: true }]}
                >
                  <Input.Password readOnly={loading} />
                </Form.Item>

                <Form.Item>
                  <Button
                    htmlType='submit'
                    className='btn-login'
                    type='primary'
                    loading={loading}
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
          <div className='bottom'>
            <div className='d-flex justify-between'>
              <div>
                <p>&copy; SaaScape 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
