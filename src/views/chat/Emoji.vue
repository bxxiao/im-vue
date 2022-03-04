<template>
  <div class="emoji">

    <ul class="emoji-default">
      <!--@click.stop="chooseEmojiDefault(item)"-->
      <li v-for="(item, index) in emojiJson" :key="index"
          >
        {{item}}
      </li>
    </ul>
    <div class="emoji-tabs">
      <div class="emoji-tab">
        {{ emojiJson[0]}}
      </div>
    </div>

  </div>
</template>

<script>
import emojiJson from '../../assets/emoji.json';

export default {
  name: "Emoji",
  data() {
    return {
      emojiJson,
    }
  }
}
</script>

<style scoped>
</style>