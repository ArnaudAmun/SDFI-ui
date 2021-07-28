<template>
  <div class="bg">
    <p class="title">SDFI UI</p>
    <div>
      <div class="mb-1">
          <label for="">Throwaway Amun private key (as byte array from sollet.io, without the '[]')</label>
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
          <label for="">Token A Public Key</label>
          <input class="display-block" type="text" v-model="formState.tokenAPubkey">
      </div>
      <div class="mb-1">
          <label for="">Token B Public Key</label>
          <input class="display-block" type="text" v-model="formState.tokenBPubkey">
      </div>
      <div class="mb-1">
          <label for="">Token A weight</label>
          <input class="display-block" type="number" v-model="formState.tokenAWeight">
      </div>
      <div class="mb-1">
          <label for="">Token B weight</label>
          <input class="display-block" type="number" v-model="formState.tokenBWeight">
      </div>
    </div>
    <div class="mb-1">
          <input style="margin-right: 5px;" class="cursor-pointer border-none bg-btn normal-font-size" type="submit" value="Reset UI" @click="resetUpdateUI">
          <input class="cursor-pointer border-none bg-btn normal-font-size" type="submit" value="Update SDFI" @click="onUpdateSDFI">
      </div>
    <div>
      <div class="mb-1">
        SDFI account:
        <div>{{ sdfiState.sdfiAccountPubkey ?? '--' }}</div>
      </div>
      <div class="mb-1">
        Decoded State
      </div>
      <div class="mb-1">
        Is initialized:
        <div>{{ sdfiState.isInitialized ?? '--' }}</div>
      </div>
      <div class="mb-1">
        Initializer account:
        <div>{{ sdfiState.initializerAccountPubkey ?? '--' }}</div>
      </div>
      <div class="mb-1">
        Token A Public Key:
        <div>{{ sdfiState.tokenAPubkey ?? '--' }}</div>
      </div>
      <div class="mb-1">
        Token B Public Key
        <div>{{ sdfiState.tokenBPubkey ?? '--' }}</div>
      </div>
      <div class="mb-1">
        Token A Weight:
        <div>{{ sdfiState.tokenAWeight ?? '--' }}</div>
      </div>
      <div class="mb-1">
        Token B Weight:
        <div>{{ sdfiState.tokenBWeight ?? '--' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { updateSDFI } from "./util/updateSDFI";

interface SDFIState {
    sdfiAccountPubkey: null | string;
    isInitialized: null | boolean;
    initializerAccountPubkey: null | string;

    tokenAPubkey: null | string;
    tokenBPubkey: null | string;
    tokenAWeight: null | number;
    tokenBWeight: null | number;
}

export default defineComponent({
  setup() {
    const formState = reactive({
      privateKey: "",
      programId: "",
      sdfiAccountPubkey: "",
      tokenAPubkey: "",
      tokenBPubkey: "",
      tokenAWeight: 0,
      tokenBWeight: 0
    })

    const sdfiState: SDFIState = reactive({
      sdfiAccountPubkey: null,
      isInitialized: null,
      initializerAccountPubkey: null,
      tokenAPubkey: null,
      tokenBPubkey: null,
      tokenAWeight: null,
      tokenBWeight: null,
    });

    const resetUpdateUI = () => {
      formState.privateKey = "";
      formState.programId = "";
      formState.sdfiAccountPubkey = "";
      formState.tokenAPubkey = "";
      formState.tokenBPubkey = "";
      formState.tokenAWeight = 0;
      formState.tokenBWeight = 0;
      Object.keys(sdfiState).forEach(key => sdfiState[key as keyof SDFIState] = null);
    }

    const onUpdateSDFI = async () => {
      try {
        const { 
          sdfiAccountPubkey,
          isInitialized,
          initializerAccountPubkey,
          tokenAPubkey,
          tokenBPubkey,
          tokenAWeight,
          tokenBWeight,
        } = await updateSDFI(
          formState.privateKey,
          formState.programId,
          formState.sdfiAccountPubkey,
          formState.tokenAPubkey,
          formState.tokenBPubkey,
          formState.tokenAWeight,
          formState.tokenBWeight,
        );
        sdfiState.sdfiAccountPubkey = sdfiAccountPubkey;
        sdfiState.isInitialized = isInitialized;
        sdfiState.initializerAccountPubkey = initializerAccountPubkey;
        sdfiState.tokenAPubkey = tokenAPubkey;
        sdfiState.tokenBPubkey = tokenBPubkey;
        sdfiState.tokenAWeight = tokenAWeight;
        sdfiState.tokenBWeight = tokenBWeight;
      } catch(err) {
        console.error(err);
        alert(err.message);
      }
    }

    return {
      formState,
      resetUpdateUI,
      onUpdateSDFI,
      sdfiState
    }
  }
})
</script>
