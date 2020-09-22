<template>
  <div class="login-container">
    <van-nav-bar
      title="登录"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 登录表单 -->
    <!--// 仅仅是提供了一个上下外边框，能看到包裹的区域-->
    <!--
      基于Vant 的表单验证:
      1. 使用van-form 组件包裹所有的表单项  van-field
      2 给van-form 绑定submit 事件 当表单提交的时候会触发 submit事件
        提示： 只有表单验证通过,它才会调用submit
      -->
    <van-form 
     :show-error="false"
     :show-error-message="false"
     validate-first
     ref="login-form"
     @submit="onLogin"
     @failed="onFailed"
     > 

    
      <van-field
        v-model="user.mobile"
        icon-prefix="toutiao"
        left-icon="shouji"
        center
        placeholder="请输入手机号"
        name="mobile"
        :rules="formRules.mobile"
      />
      <van-field
        v-model="user.code"
        clearable
        icon-prefix="toutiao"
        left-icon="yanzhengma"
        center
        placeholder="请输入验证码"
        name="code"
        :rules="formRules.code"
      >
        <template #button>
        <van-count-down 
         v-if="isCountDownShow"
        :time="1000 * 60"
        format = "ss s"
        @finish="isCountDownShow = false"
        />
          <van-button
          v-else
          class="send-btn"
            size="mini"
            round
            :loading = "isSendSmsloading"
            @click.prevent="onSendSms"
          >发送验证码</van-button>
        </template>
      </van-field>
      <div class="login-btn-wrap">
    <van-button
      class="login-btn"
      type="info"
      block
    >
    登录
    </van-button>
    </div>
    </van-form>
    
    
    <!-- /登录表单 -->
  </div>
</template>

<script>
import {login, sendSms} from '@/api/user'
export default {
  name: 'LoginIndex',
  components: {},
  props: {},
  data () {
    return {
       user: {
        mobile: '17090086870', // 手机号
        code: '246810' // 验证码
      },
    formRules: {
        mobile:[
          {required: true, message:'请输入手机号'},
          {pattern: /^1[3|5|6|7|8|9]\d{9}$/, message:'手机号格式错误'}
          ],
        code: [
           {required: true, message:'请输入验证码'},
          {pattern: /\d{6}$/, message:'验证码格式错误'}
        ]
      },
      isCountDownShow: false,  // 控制倒计时和发送按钮的显示状态
      isSendSmsloading: false  // 发送验证码按钮的loading状态
    }
    
  
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {
    async onLogin(){
      this.$toast.loading({
        message: '登陆中...',   // 登陆提示文本
        forbidClick: true,  // 是否禁止背景点击
        duration: 0       // 展示时长(ms) 值为0 时, toast 不会消失
      })
      try {
         const { data } = await login(this.user)
         // 处理响应结果
         this.$toast.success('登陆成功')
         // 将后端返回的用户登录状态(token等数据)放到Vuex 容器中
         this.$store.commit('setUser', data.data)
         
         
      } catch (err) {
        console.log(err);
        this.$toast.fail('登陆失败! 手机号或者验证码错误')
      }
     
    },
    onFailed(error){
      if(error.errors[0]){
        this.$toast({
          message: error.errors[0].message,
          postion: 'top'
        })
      }
    },
    async onSendSms(){

      try {
        const validateRes = await  this.$refs['login-form'].validate('mobile')
        
        // 验证通过,请求发送验证码
        // 展示按钮的loading状态，防止网络慢用户多次点击触发发送行为
        this.isSendSmsloading = true 

        await sendSms(this.user.mobile)
        // 短信发出去了 隐藏发送按钮 显示倒计时
        this.isCountDownShow = true
      } catch(err){
        // try 里面任何代码错误都会进入catch 不同的错误需要有不同的提示,那就需要判断了
        let message = ''
        if(err && err.response && err.response.status === 429){
          // 发送短信失败的错误提示
          message = '发送太频繁,请稍后重试'
        } else if(err.name === 'mobile') {
          // 表单验证失败的错误提示
          message = err.message
        } else {
          message = '发送失败,请稍后重试'
        }
        // 提示用户
        this.$toast({
          message,
          postion:'top'
        })
      
      }
      // 无论最后发送验证码成功还是失败,最后都要关闭发送按钮的loading状态
    this.isSendSmsloading = false
    }
    
  }
}
</script>

<style scoped lang="less">
.login-container {
  .send-btn {
    width: 76px;
    height: 23px;
    background-color: #ededed;
    .van-button__text {
      font-size: 11px;
      color: #666666;
    }
  }
  .login-btn-wrap {
    padding: 26px 16px;
    .login-btn {
      background-color: #6db4fb;
      border: none;
      .van-button__text {
        font-size: 15px;
      }
    }
  }
}
</style>