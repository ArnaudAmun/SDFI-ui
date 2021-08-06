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
          <label for="">SDFI mint account</label>
          <input class="display-block" type="text" v-model="formState.sdfiMintPubkey">
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
      privateKey: "232,127,125,58,149,243,202,118,146,28,128,95,79,122,212,242,31,183,153,186,94,254,181,24,233,185,18,180,104,102,171,154,239,3,219,127,112,189,36,15,29,243,146,243,176,204,129,119,152,76,134,138,176,35,194,194,30,239,49,161,116,143,77,155",
      programId: "D17TpV1tDB2Qi5hvfiivZad1hwTRCmf1kGXj2RukuhaS",
      sdfiMintPubkey: "3hdqisPzTovceJHauD9sL57QCUwrXNhpXpumxXw2uLDi",
      sdfiAccountPubkey: "AKVS3VwfQfyBJJzPxVakQuzVf2SRoEqKwkwTxmTwjkG8",
      amount: 1
    })

    const resetUpdateUI = () => {
      formState.privateKey = "";
      formState.programId = "";
      formState.sdfiMintPubkey = "";
      formState.sdfiAccountPubkey = "";
      formState.amount = 0;
    }

    const onMintSDFI = async () => {
      try {
        await mintSDFI(
          formState.privateKey,
          formState.programId,
          formState.sdfiMintPubkey,
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
