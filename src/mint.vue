<template>
  <div class="bg">
    <p class="title">SDFI UI</p>
    <div>
      <div class="mb-1">
          <label for="">Throwaway User private key (as byte array from sollet.io, without the '[]')</label>
          <input class="display-block" type="text" v-model="formState.privateKey">
      </div>
      <div class="mb-1">
          <label for="">Program id</label>
          <input class="display-block" type="text" v-model="formState.programId">
      </div>
      <div class="mb-1">
          <label for="">SDFI state account</label>
          <input class="display-block" type="text" v-model="formState.sdfiAccountPubkey">
      </div>
      <div class="mb-1">
          <label for="">Desired SDFI amount</label>
          <input class="display-block" type="number" v-model="formState.amount" step="0.01" min="0">
      </div>
    </div>
    <div class="mb-1">
        <input style="margin-right: 5px;" class="cursor-pointer border-none bg-btn normal-font-size" type="submit" value="Reset UI" @click="resetUpdateUI">
        <input class="cursor-pointer border-none bg-btn normal-font-size" type="submit" value="trade SDFI" @click="onMintSDFI">
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { mintSDFI } from "./util/mintSDFI";


export default defineComponent({
  setup() {
    const formState = reactive({
      privateKey: "",
      programId: "",
      sdfiAccountPubkey: "",
      amount: 0
    })

    const resetUpdateUI = () => {
      formState.privateKey = "";
      formState.programId = "";
      formState.sdfiAccountPubkey = "";
      formState.amount = 0;
    }

    const onMintSDFI = async () => {
      try {
        await mintSDFI(
          formState.privateKey,
          formState.programId,
          formState.sdfiAccountPubkey,
          formState.amount,
        );
      } catch(err) {
        console.error(err);
        alert(err.message);
      }
    }

    return {
      formState,
      resetUpdateUI,
      onMintSDFI,
    }
  }
})
</script>
