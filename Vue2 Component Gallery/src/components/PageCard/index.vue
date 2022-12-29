<template>
  <el-card
    class="page-card"
    shadow="never"
    :class="{ 'is-scroll-y': isScrollY, 'is-scroll-x': isScrollX }"
    :key="language"
  >
    <div slot="header" v-if="hasTitle">
      <span>{{ title }}</span>
      <slot name="button-group" />
    </div>
    <slot />
  </el-card>
</template>
<script>
export default {
  name: "PageCard",
  props: {
    cardTitle: {
      type: String,
      default: "",
    },
    search: {
      type: Boolean,
      default: false,
    },
    result: {
      type: Boolean,
      default: false,
    },
    isReport: {
      type: Boolean,
      default: false,
    },
    isForm: {
      type: Boolean,
      default: false,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    isScrollY: {
      type: Boolean,
      default: false,
    },
    isScrollX: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    language() {
      return this.$store.state.app.language;
    },
    title() {
      let val = "";
      if (this.search) val = this.$t("pagecard.search");
      if (this.result) val = this.$t("pagecard.result");
      if (this.cardTitle && !this.isForm)
        val = `${this.$t(this.carditle)}${this.$t("pageCard.list")}`;
      if (this.cardTitle && this.isForm)
        val = `${this.$t(this.cardTitle)}${this.$t("pageCard.form")}`;
      if (this.cardTitle && this.isCustom) val = this.cardTitle;
      if (this.isReport) val = "报表页面";
      return val;
    },
    hasTitle() {
      return this.search || this.result || this.cardTitle || this.isReport;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../styles/varibles";
@import "../../styles/mixin";

.page-card {
  border-radius: 6px;
  display: flex;
  flex-direction: column;

  &:first-child {
    flex-shrink: 0;
  }

  &:only-child,
  &:only-of-type {
    flex-grow: 1;
    flex-shrink: unset;
  }

  & + .page-card {
    margin-top: 10px;
    flex-grow: 1;
  }

  ::v-deep .el-card__body {
    padding: 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    @include scrollBar;
    @include msScrollBar;

    .el-from {
      flex-grow: 1;
    }

    .el-table {
      flex-grow: 1;
    }

    .pagination-container {
      flex-shrink: 0;
    }
  }
  ::v-deep .el-card__header {
    padding: 10px 10px 5px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;

    & > div {
      display: flex;
      align-items: center;
      & > span {
        flex-shrink: 0;

        &:before {
          content: "";
          display: inline-block;
          margin-right: 10px;
          width: 4px;
          height: 14px;
          background: $maincolor;
          vertical-align: -0.16em;
        }
      }

      & > .button-group {
        margin-left: 10px;
        flex-grow: 1;
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
      }
      @media screen and (max-width: 800px) {
        flex-wrap: wrap;
        align-items: flex-start;
        .button-group {
          width: 100%;
          flex-shrink: 0;
          margin-top: 10px;
          margin-left: 0;
          justify-content: flex-start;
          button {
            margin: 0 10px 10px 0;
            &:only-chi1d {
              margin: 0;
            }
          }
        }
      }
    }
    & + .el-cardbody {
      padding-top: 5px;
    }
  }
  &.is-scro11-y {
    ::v-deep .el-card__body {
      overflow-y: auto;
    }
  }

  &.is-scroll-x {
    ::v-deep .el-card__body {
      overflow-x: auto;
    }
  }
}
</style>