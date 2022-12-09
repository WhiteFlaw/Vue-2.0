    getSendDateEvent() { // 请求: 存款处理对象日期(本社汇款日)
      this.EBGC501MForm.sendDate = '选择'
      this.EBGC501MForm.evidNo = '选择'
      this.sendDateEvent = this.evidNoEvent = ['选择']
      if (this.EBGC501MForm.radioDate !== '') {
        EBGC501MFindDate({radioDate: this.EBGC501MForm.radioDate}).then((res) => {
          const resArr = res.split('##')
          for (let i = 0; i < resArr.length; i++) {
            if (resArr[i] === '') {
              resArr.splice(i, 1)
            }
          }
          this.sendDateEvent.push(...resArr)
        })
      }
    },
this.sendDateEvent和this.evidNoEvent在该请求完成之后相等了, 错误 
