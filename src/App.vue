<template>
  <div class="wraps">
    <el-form
      :label-position="labelPosition"
      label-width="100px"
      :model="formLabelAlign"
      style="max-width: 460px"
    >
      <el-form-item label="句子">
        <el-input type="textarea" input-style="height: 300px" v-model="formLabelAlign.one" />
      </el-form-item>
      <el-form-item label="更改后的句子">
        <el-input type="textarea" input-style="height: 300px" v-model="formLabelAlign.two" />
      </el-form-item>
      <el-form-item label="">
        <el-button @click="diffFunc">比较</el-button>
        <el-button @click="oldFn()">保留历史</el-button>
        <el-button @click="newFn()">保留最新</el-button>
      </el-form-item>
    </el-form>
    <div class="result-box">
      比较结果:<br/>
      <template v-for="(item, i) in formLabelAlign.result">
        <span v-if="!item.isModify" :key="item.id" class="txt" :class="{ add: item.added, remove: item.removed }">{{item.value}}</span>
        <template v-else>
          <span v-if="item.old" :key="item.id + '-old'" :id="'modify-' + item.id" class="txt" :class="{ add: item.old.added, remove: item.old.removed }">{{item.old.value}}</span>
          <span v-if="item.new" :key="item.id + '-new'" class="txt" :class="{ add: item.new.added, remove: item.new.removed }">{{item.new.value}}</span>
        </template>
      </template>
      
      <!-- 操作 -->
      <template v-for="(item, i) in formLabelAlign.modifyArr">
        <div class="modify-btn" :style="{ top: item.top + 'px', right: '20px' }">
          <el-button @click="oldFn(item.id)">保留历史</el-button>
          <el-button @click="newFn(item.id)">保留最新</el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from "vue";
import * as Diff from 'diff'
const labelPosition = ref<string>("right");

const formLabelAlign = reactive<any>({
  one: `添加数据：添加

修改数据：数据

删除数据：数据`,
  two: `添加数据：添加数据

修改数据：修改

删除数据：`,
  result: [],
  oldResult: [],
  modifyArr: []
});
const diffFunc = () => {
  const res = Diff.diffChars( formLabelAlign.one, formLabelAlign.two)
  
  const newR = res.reduce((arr: any[], item: any, index: number) => {
    if (item.added || item.removed) {
      const len = arr.length
      if (len === 0 || !arr[len - 1].isModify) {
        arr.push({
          id: index,
          isModify: true,
          old: item,
          new: null
        })
      } else {
        arr[len - 1].new = item
      }
    } else {
      item.id = index
      item.isModify = false
      arr.push(item)
    }
    return arr
  }, [])
  console.log(res)
  console.log(newR)
  formLabelAlign.oldResult = newR
  formLabelAlign.result = newR

  nextTick(() => {
    formLabelAlign.result.forEach((item: any) => {
      if (item.isModify) {
        const dom = document.getElementById('modify-'+item.id)
        console.log(dom?.offsetTop)
        formLabelAlign.modifyArr.push({
          id: item.id,
          top: dom?.offsetTop
        })
      }
    });
  })
}
const oldFn = (id?: string) => {
  const data = id === undefined ? formLabelAlign.oldResult : formLabelAlign.result
  formLabelAlign.result = data.map((item: any) => {
    const compareId = id === undefined ? true : item.id === id
    if (item.isModify && compareId) {
      // 修改
      if (item.new && item.old) {
        return {
          id: item.id,
          isModify: false,
          count: item.old.count,
          value: item.old.value
        }
      } 
      // 添加
      else if (item.old.added) {
        return {
          id: item.id,
          isModify: false,
          count: 0,
          value: ''
        }
      } 
      // 删除
      else if (item.old.removed) {
        return {
          id: item.id,
          isModify: false,
          count: item.old.count,
          value: item.old.value
        }
      } else {
        return item
      }
    } else {
      return item
    }
  });
  console.log('保留历史', formLabelAlign.result)
  if (id) {
    const i = formLabelAlign.modifyArr.findIndex((v: any) => v.id == id)
    if (i >= 0) {
      formLabelAlign.modifyArr.splice(i, 1)
    }
  }
  
}
const newFn = (id?: string) => {
  const data = id === undefined ? formLabelAlign.oldResult : formLabelAlign.result
  formLabelAlign.result = data.map((item: any) => {
    const compareId = id === undefined ? true : item.id === id
    if (item.isModify && compareId) {
      // 修改
      if (item.new && item.old) {
        return {
          id: item.id,
          isModify: false,
          count: item.new.count,
          value: item.new.value
        }
      } 
      // 添加
      else if (item.old.added) {
        return {
          id: item.id,
          isModify: false,
          count: item.old.count,
          value: item.old.value
        }
      } 
      // 删除
      else if (item.old.removed) {
        return {
          id: item.id,
          isModify: false,
          count: 0,
          value: ''
        }
      } else {
        return item
      }
    } else {
      return item
    }
  });
  console.log('保留最新', formLabelAlign.result)
  if (id) {
    const i = formLabelAlign.modifyArr.findIndex((v: any) => v.id == id)
    if (i >= 0) {
      formLabelAlign.modifyArr.splice(i, 1)
    }
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

.wraps {
  /* display: flex;
  justify-content: center;
  align-items: center; */
  /* height: inherit; */
}

html,
body,
#app {
  height: 100%;
}
.add {
  color:#00ff39;
}
.remove {
  color: red;
}
.txt {
  white-space: pre-wrap;
}
.result-box {
  position: relative;
}
.modify-btn {
  position: absolute;
}
</style>
