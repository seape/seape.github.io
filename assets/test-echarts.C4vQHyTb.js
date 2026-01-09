import { n as createVNode, F as Fragment, _ as __astro_tag_component__ } from './astro/server.CsXMQSOf.js';
import { defineComponent, useSSRContext, ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import 'vue/server-renderer';
/* empty css                                                                              */
import 'clsx';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "EChartsCard",
  props: {
    // 图表配置项
    option: {
      type: Object,
      required: true
    },
    // 图表宽度
    width: {
      type: String,
      default: "100%"
    },
    // 图表高度
    height: {
      type: String,
      default: "400px"
    },
    // 主题：'light' | 'dark'
    theme: {
      type: String,
      default: "light"
    },
    // 是否自动调整大小
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const chartContainer = ref();
    let chartInstance = null;
    const containerStyle = computed(() => ({
      width: props.width,
      height: props.height
    }));
    const initChart = () => {
      if (!chartContainer.value) {
        console.error("[ECharts] Container not found");
        return;
      }
      if (chartInstance) {
        chartInstance.dispose();
      }
      try {
        chartInstance = echarts.init(chartContainer.value, props.theme);
        chartInstance.setOption(props.option);
        console.log("[ECharts] Chart initialized successfully");
      } catch (error) {
        console.error("[ECharts] Error initializing chart:", error);
      }
    };
    const updateChart = () => {
      if (chartInstance) {
        chartInstance.setOption(props.option, true);
      }
    };
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };
    onMounted(async () => {
      await nextTick();
      initChart();
      if (props.autoResize) {
        window.addEventListener("resize", handleResize);
      }
    });
    onUnmounted(() => {
      if (props.autoResize) {
        window.removeEventListener("resize", handleResize);
      }
      if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
      }
    });
    watch(() => props.option, updateChart, { deep: true });
    watch(() => props.theme, initChart);
    __expose({
      getInstance: () => chartInstance,
      resize: handleResize
    });
    const __returned__ = { props, chartContainer, get chartInstance() {
      return chartInstance;
    }, set chartInstance(v) {
      chartInstance = v;
    }, containerStyle, initChart, updateChart, handleResize };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/EChartsCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

const frontmatter = {
  "title": "ECharts 图表测试",
  "description": "测试在 MDX 文件中使用 ECharts Vue 组件",
  "pubDate": "2024-12-11T00:00:00.000Z",
  "category": "测试",
  "tags": ["echarts", "vue", "可视化"]
};
function getHeadings() {
  return [{
    "depth": 1,
    "slug": "echarts-图表组件测试",
    "text": "ECharts 图表组件测试"
  }, {
    "depth": 2,
    "slug": "折线图示例",
    "text": "折线图示例"
  }, {
    "depth": 2,
    "slug": "饼图示例",
    "text": "饼图示例"
  }, {
    "depth": 2,
    "slug": "柱状图示例",
    "text": "柱状图示例"
  }, {
    "depth": 2,
    "slug": "使用说明",
    "text": "使用说明"
  }, {
    "depth": 3,
    "slug": "组件属性",
    "text": "组件属性"
  }, {
    "depth": 3,
    "slug": "基本用法",
    "text": "基本用法"
  }];
}
function _createMdxContent(props) {
  const _components = {
    blockquote: "blockquote",
    code: "code",
    div: "div",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    p: "p",
    pre: "pre",
    span: "span",
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ...props.components
  };
  return createVNode(Fragment, {
    children: [createVNode(_components.div, {
      class: "container-info custom-container",
      "data-container-type": "info",
      children: ["\n", createVNode(_components.div, {
        class: "container-title",
        children: "测试用例"
      }), "\n", createVNode(_components.div, {
        class: "container-content",
        children: ["\n", createVNode(_components.p, {
          children: "这是测试信息"
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.h1, {
      id: "echarts-图表组件测试",
      children: "ECharts 图表组件测试"
    }), "\n", createVNode(_components.p, {
      children: "本文演示如何在 MDX 文件中使用 ECharts 组件来展示数据可视化图表。"
    }), "\n", createVNode(_components.h2, {
      id: "折线图示例",
      children: "折线图示例"
    }), "\n", createVNode("astro-client-only", {
      "client:only": "vue",
      option: {
        title: {
          text: '月度销售数据',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '销售额',
          type: 'line',
          data: [150, 230, 224, 218, 135, 147],
          smooth: true,
          lineStyle: {
            color: '#5470c6'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(84, 112, 198, 0.5)'
              }, {
                offset: 1,
                color: 'rgba(84, 112, 198, 0.1)'
              }]
            }
          }
        }]
      },
      height: "350px",
      "client:display-name": "ECharts",
      "client:component-path": "@/components/EChartsCard.vue",
      "client:component-export": "default",
      "client:component-hydration": true
    }), "\n", createVNode(_components.h2, {
      id: "饼图示例",
      children: "饼图示例"
    }), "\n", createVNode("astro-client-only", {
      "client:only": "vue",
      option: {
        title: {
          text: '访问来源',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          name: '访问来源',
          type: 'pie',
          radius: '50%',
          data: [{
            value: 1048,
            name: '搜索引擎'
          }, {
            value: 735,
            name: '直接访问'
          }, {
            value: 580,
            name: '邮件营销'
          }, {
            value: 484,
            name: '联盟广告'
          }, {
            value: 300,
            name: '视频广告'
          }],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      },
      height: "400px",
      "client:display-name": "ECharts",
      "client:component-path": "@/components/EChartsCard.vue",
      "client:component-export": "default",
      "client:component-hydration": true
    }), "\n", createVNode(_components.h2, {
      id: "柱状图示例",
      children: "柱状图示例"
    }), "\n", createVNode("astro-client-only", {
      "client:only": "vue",
      option: {
        title: {
          text: '周访问量统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '访问量',
          type: 'bar',
          data: [120, 200, 150, 80, 70, 110, 130],
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: '#83bff6'
              }, {
                offset: 0.5,
                color: '#188df0'
              }, {
                offset: 1,
                color: '#188df0'
              }]
            }
          }
        }]
      },
      height: "350px",
      "client:display-name": "ECharts",
      "client:component-path": "@/components/EChartsCard.vue",
      "client:component-export": "default",
      "client:component-hydration": true
    }), "\n", createVNode(_components.h2, {
      id: "使用说明",
      children: "使用说明"
    }), "\n", createVNode(_components.h3, {
      id: "组件属性",
      children: "组件属性"
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "属性"
          }), createVNode(_components.th, {
            children: "类型"
          }), createVNode(_components.th, {
            children: "默认值"
          }), createVNode(_components.th, {
            children: "说明"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "option"
            })
          }), createVNode(_components.td, {
            children: "Object"
          }), createVNode(_components.td, {
            children: "必填"
          }), createVNode(_components.td, {
            children: "ECharts 配置项"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "width"
            })
          }), createVNode(_components.td, {
            children: "String"
          }), createVNode(_components.td, {
            children: "’100%‘"
          }), createVNode(_components.td, {
            children: "图表宽度"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "height"
            })
          }), createVNode(_components.td, {
            children: "String"
          }), createVNode(_components.td, {
            children: "’400px’"
          }), createVNode(_components.td, {
            children: "图表高度"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "theme"
            })
          }), createVNode(_components.td, {
            children: "String"
          }), createVNode(_components.td, {
            children: "’light’"
          }), createVNode(_components.td, {
            children: "主题：‘light’ 或 ‘dark’"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "autoResize"
            })
          }), createVNode(_components.td, {
            children: "Boolean"
          }), createVNode(_components.td, {
            children: "true"
          }), createVNode(_components.td, {
            children: "是否自动调整大小"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h3, {
      id: "基本用法",
      children: "基本用法"
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "mdx",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "import EChartsTest from '../../components/ECharts_Test.vue'"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<ECharts"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  client:only=\"vue\""
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  option={{"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    xAxis: { type: 'category', data: "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "["
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "'A', 'B', 'C'"
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "]"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " },"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    yAxis: { type: 'value' },"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    series: "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "["
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "{ type: 'bar', data: "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "["
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "10, 20, 30"
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "]"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " }"
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "]"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  }}"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "/>"
          })
        })]
      })
    }), "\n", createVNode("astro-client-only", {
      "client:only": "vue",
      option: {
        xAxis: {
          type: 'category',
          data: ['A', 'B', 'C']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar',
          data: [10, 20, 30]
        }]
      },
      "client:display-name": "ECharts",
      "client:component-path": "@/components/EChartsCard.vue",
      "client:component-export": "default",
      "client:component-hydration": true
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: ["注意：必须添加 ", createVNode(_components.code, {
          children: "client:only=\"vue\""
        }), " 指令才能在客户端渲染图表。"]
      }), "\n"]
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? createVNode(MDXLayout, {
    ...props,
    children: createVNode(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}

const url = "content/posts/test/test-echarts.mdx";
const file = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/posts/test/test-echarts.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/posts/test/test-echarts.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, url };
