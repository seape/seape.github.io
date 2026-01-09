import { n as createVNode, F as Fragment, _ as __astro_tag_component__ } from './astro/server.CsXMQSOf.js';
import { mergeProps, computed, ref, onMounted, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
/* empty css                                                                                */
import { _ as _export_sfc } from './plugin-vue_export-helper.pcqpp-6-.js';
import 'clsx';

// Props 定义

const _sfc_main = {
  __name: 'StudyCalendar',
  props: {
  // 学习阶段配置
  phases: {
    type: Array,
    default: () => [
      { id: 1, name: '基础阶段', color: '#10b981', weeks: 4 },
      { id: 2, name: '强化阶段', color: '#3b82f6', weeks: 4 },
      { id: 3, name: '冲刺阶段', color: '#f59e0b', weeks: 4 },
    ]
  },
  // 学习计划配置
  studyPlan: {
    type: Object,
    default: () => ({
      // 阶段1的任务
      phase1: {
        weekday: [
          { title: '任务1', duration: '1小时', description: '描述1', materials: '资料1' },
        ],
        weekend: [
          { title: '周末任务', duration: '2小时', description: '周末描述', materials: '周末资料' },
        ]
      },
      phase2: {
        weekday: [
          { title: '任务2', duration: '1.5小时', description: '描述2', materials: '资料2' },
        ],
        weekend: [
          { title: '周末任务', duration: '3小时', description: '周末描述', materials: '周末资料' },
        ]
      },
      phase3: {
        weekday: [
          { title: '任务3', duration: '2小时', description: '描述3', materials: '资料3' },
        ],
        weekend: [
          { title: '周末任务', duration: '3小时', description: '周末描述', materials: '周末资料' },
        ]
      }
    })
  },
  // 开始日期（默认今天）
  startDate: {
    type: String,
    default: ''
  },
  // 按日期精确配置（优先级高于周配置）
  // 格式: { 'YYYY-MM-DD': { title, duration, description, materials, exercises } }
  dateConfig: {
    type: Object,
    default: () => ({})
  },
  // 标题
  title: {
    type: String,
    default: '学习日历'
  }
},
  setup(__props, { expose: __expose }) {
  __expose();

const props = __props;

// 解析阶段配置
const parsedPhases = computed(() => {
  return props.phases.map((phase, index) => ({
    ...phase,
    id: phase.id || index + 1
  }));
});

// 计算总天数
const totalDays = computed(() => {
  return parsedPhases.value.reduce((sum, phase) => sum + (phase.weeks || 0) * 7, 0);
});

// 星期
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

// 当前日期
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDay = ref(null);
const showModal = ref(false);

// 检查任务是否已完成（用于没有exercises的任务）
function isTaskCompleted(day, taskIndex) {
  if (!day) return false;
  const task = day.tasks[taskIndex];
  if (!task) return false;

  // 如果有 exercises，检查是否全部完成
  if (task.exercises && task.exercises.length > 0) {
    return task.exercises.every((ex, exIndex) => {
      const done = getExerciseDone(day, taskIndex, exIndex);
      return done >= ex.quantity;
    });
  }

  // 没有 exercises，检查任务的 completed 字段
  return task.completed === true;
}

// 检查单个练习是否已完成
function isExerciseCompleted(day, taskIndex, exIndex) {
  if (!day) return false;
  const task = day.tasks[taskIndex];
  if (!task || !task.exercises || !task.exercises[exIndex]) return false;

  const done = getExerciseDone(day, taskIndex, exIndex);
  return done >= task.exercises[exIndex].quantity;
}

// 获取练习完成数量（从 exercises 的 completed 字段读取）
function getExerciseDone(day, taskIndex, exIndex) {
  if (!day) return 0;
  const task = day.tasks[taskIndex];
  if (!task || !task.exercises || !task.exercises[exIndex]) return 0;

  const exercise = task.exercises[exIndex];
  return exercise.completed || 0;
}

// 计算任务完成百分比
function getTaskCompletionPercent(day, taskIndex) {
  if (!day) return 0;
  const task = day.tasks[taskIndex];
  if (!task || !task.exercises || task.exercises.length === 0) return 0;

  let totalQuantity = 0;
  let totalDone = 0;

  task.exercises.forEach((exercise, exIndex) => {
    totalQuantity += exercise.quantity;
    totalDone += getExerciseDone(day, taskIndex, exIndex);
  });

  if (totalQuantity === 0) return 0;
  return Math.round((totalDone / totalQuantity) * 100);
}

// 检查是否是过去的日期
function isPastDay(day) {
  if (!day || !day.dateObj) return false;
  const dayDate = new Date(day.dateObj);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  dayDate.setHours(0, 0, 0, 0);
  return dayDate < todayDate;
}

// 获取日期状态
function getDayStatus(day) {
  if (!day || day.tasks.length === 0) return null;

  const dayDate = new Date(day.dateObj);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  dayDate.setHours(0, 0, 0, 0);

  // 检查是否所有任务都完成
  let allCompleted = true;
  day.tasks.forEach((task, taskIndex) => {
    if (task.exercises && task.exercises.length > 0) {
      // 有练习详情，检查每个练习
      if (getTaskCompletionPercent(day, taskIndex) < 100) {
        allCompleted = false;
      }
    } else {
      // 无练习详情，检查任务整体
      if (!isTaskCompleted(day, taskIndex)) {
        allCompleted = false;
      }
    }
  });

  if (allCompleted) return 'completed';
  if (dayDate.getTime() === todayDate.getTime()) return 'today';
  if (dayDate < todayDate) return 'pending';
  return 'future';
}

// 打开弹窗
function openModal(day) {
  selectedDay.value = day;
  showModal.value = true;
  document.body.style.overflow = 'hidden';
}

// 关闭弹窗
function closeModal() {
  showModal.value = false;
  document.body.style.overflow = '';
}

// 备考开始日期
const planStartDate = computed(() => {
  if (props.startDate) {
    const date = new Date(props.startDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  const date = new Date(today);
  date.setHours(0, 0, 0, 0);
  return date;
});

// 月份名称
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                    '七月', '八月', '九月', '十月', '十一月', '十二月'];

const currentMonthName = computed(() => monthNames[currentMonth.value]);

// 获取阶段信息
function getPhaseInfo(weekNumber) {
  let accumulatedWeeks = 0;
  for (let i = 0; i < parsedPhases.value.length; i++) {
    const phase = parsedPhases.value[i];
    accumulatedWeeks += phase.weeks || 0;
    if (weekNumber <= accumulatedWeeks) {
      return {
        phase: phase,
        phaseIndex: i + 1,
        phaseName: phase.name,
        color: phase.color
      };
    }
  }
  return null;
}

// 格式化日期为 YYYY-MM-DD
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 生成任务
function generateTasks(date) {
  const tasks = [];
  const daysDiff = Math.floor((date - planStartDate.value) / (1000 * 60 * 60 * 24));

  // 检查是否在备考范围内
  if (daysDiff < 0 || daysDiff >= totalDays.value) return tasks;

  const weekNumber = Math.floor(daysDiff / 7) + 1;
  const phaseInfo = getPhaseInfo(weekNumber);
  if (!phaseInfo) return tasks;

  // 检查日期配置
  const dateKey = formatDateKey(date);
  const hasDateConfig = props.dateConfig && Object.keys(props.dateConfig).length > 0;
  const dateTask = props.dateConfig && props.dateConfig[dateKey];

  // 如果使用了日期配置模式
  if (hasDateConfig) {
    // 只有在 dateConfig 中有该日期配置时才显示任务
    if (dateTask) {
      tasks.push({
        id: daysDiff,
        title: dateTask.title || '学习任务',
        duration: dateTask.duration || '',
        description: dateTask.description || '',
        materials: dateTask.materials || '',
        exercises: dateTask.exercises || [],
        phase: dateTask.phase || phaseInfo.phaseName,
        color: phaseInfo.color,
        isCustomDate: true  // 标记为日期配置
      });
    }
    // 如果没有该日期配置，返回空任务（休息日）
    return tasks;
  }

  // 使用周配置（fallback，仅当 dateConfig 为空时）
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const phaseKey = `phase${phaseInfo.phaseIndex}`;
  const phasePlan = props.studyPlan[phaseKey];

  if (!phasePlan) return tasks;

  const dayTasks = isWeekend ? (phasePlan.weekend || []) : (phasePlan.weekday || []);

  // 根据星期几选择任务（循环使用任务列表）
  if (dayTasks.length > 0) {
    const taskIndex = isWeekend ? 0 : (dayOfWeek - 1) % dayTasks.length;
    const task = dayTasks[taskIndex];

    if (task) {
      tasks.push({
        id: daysDiff,
        title: task.title || '学习任务',
        duration: task.duration || '',
        description: task.description || '',
        materials: task.materials || '',
        exercises: task.exercises || [],
        phase: phaseInfo.phaseName,
        color: phaseInfo.color,
        isCustomDate: false
      });
    }
  }

  return tasks;
}

// 生成日历天数
const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDay = firstDay.getDay();

  // 上月填充
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i);
    days.push({
      date: prevMonthLastDay - i,
      currentMonth: false,
      isToday: false,
      tasks: generateTasks(date),
      fullDate: formatDate(date),
      dateObj: date
    });
  }

  // 当月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    const isToday = date.toDateString() === today.toDateString();
    days.push({
      date: i,
      currentMonth: true,
      isToday,
      tasks: generateTasks(date),
      fullDate: formatDate(date),
      dateObj: date
    });
  }

  // 下月填充
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push({
      date: i,
      currentMonth: false,
      isToday: false,
      tasks: generateTasks(date),
      fullDate: formatDate(date),
      dateObj: date
    });
  }

  return days;
});

// 格式化日期
function formatDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 导航
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

// 选择日期（打开弹窗）
function selectDay(day) {
  openModal(day);
}

// 统计数据
const studyDaysCount = computed(() => {
  let count = 0;
  for (let i = 0; i < totalDays.value; i++) {
    const date = new Date(planStartDate.value);
    date.setDate(planStartDate.value.getDate() + i);
    if (generateTasks(date).length > 0) count++;
  }
  return count;
});

const restDaysCount = computed(() => totalDays.value - studyDaysCount.value);

const progressPercent = computed(() => {
  const daysPassed = Math.floor((today - planStartDate.value) / (1000 * 60 * 60 * 24));
  if (daysPassed < 0) return 0;
  if (daysPassed >= totalDays.value) return 100;
  return Math.round((daysPassed / totalDays.value) * 100);
});

// 初始化
onMounted(() => {
  // 选中今天
  const todayDay = calendarDays.value.find(d => d.isToday);
  if (todayDay) {
    selectedDay.value = todayDay;
  }
});

const __returned__ = { props, parsedPhases, totalDays, weekdays, today, currentMonth, currentYear, selectedDay, showModal, isTaskCompleted, isExerciseCompleted, getExerciseDone, getTaskCompletionPercent, isPastDay, getDayStatus, openModal, closeModal, planStartDate, monthNames, currentMonthName, getPhaseInfo, formatDateKey, generateTasks, calendarDays, formatDate, prevMonth, nextMonth, selectDay, studyDaysCount, restDaysCount, progressPercent, ref, computed, onMounted };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${
    ssrRenderAttrs(mergeProps({ class: "study-calendar" }, _attrs))
  } data-v-ab7e9190><div class="calendar-header" data-v-ab7e9190><button class="nav-btn" data-v-ab7e9190>&lt;</button><h2 class="month-title" data-v-ab7e9190>${
    ssrInterpolate($setup.currentYear)
  } 年 ${
    ssrInterpolate($setup.currentMonthName)
  }</h2><button class="nav-btn" data-v-ab7e9190>&gt;</button></div><div class="phase-tags" data-v-ab7e9190><!--[-->`);
  ssrRenderList($setup.parsedPhases, (phase) => {
    _push(`<span class="phase-tag" style="${
      ssrRenderStyle({ backgroundColor: phase.color })
    }" data-v-ab7e9190>${
      ssrInterpolate(phase.name)
    } (${
      ssrInterpolate(phase.weeks)
    }周) </span>`);
  });
  _push(`<!--]--></div><div class="weekdays" data-v-ab7e9190><!--[-->`);
  ssrRenderList($setup.weekdays, (day) => {
    _push(`<div class="weekday" data-v-ab7e9190>${ssrInterpolate(day)}</div>`);
  });
  _push(`<!--]--></div><div class="calendar-grid" data-v-ab7e9190><!--[-->`);
  ssrRenderList($setup.calendarDays, (day, index) => {
    _push(`<div class="${
      ssrRenderClass([{
          'other-month': !day.currentMonth,
          'today': day.isToday,
          'has-task': day.tasks.length > 0,
          'past-day': $setup.isPastDay(day) && day.tasks.length > 0
        }, "calendar-day"])
    }" style="${
      ssrRenderStyle(day.tasks.length ? { borderLeft: `4px solid ${day.tasks[0].color}` } : {})
    }" data-v-ab7e9190><span class="day-number" data-v-ab7e9190>${
      ssrInterpolate(day.date)
    }</span><div class="day-tasks" data-v-ab7e9190><!--[-->`);
    ssrRenderList(day.tasks.slice(0, 2), (task) => {
      _push(`<div class="task-item" style="${
        ssrRenderStyle({ backgroundColor: task.color + '20', color: task.color })
      }" data-v-ab7e9190>${
        ssrInterpolate(task.title)
      }</div>`);
    });
    _push(`<!--]-->`);
    if (day.tasks.length > 2) {
      _push(`<div class="more-tasks" data-v-ab7e9190> +${ssrInterpolate(day.tasks.length - 2)} 更多 </div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div>`);
  });
  _push(`<!--]--></div>`);
  if ($setup.showModal) {
    _push(`<div class="modal-overlay" data-v-ab7e9190><div class="modal-content" data-v-ab7e9190><button class="modal-close" data-v-ab7e9190>×</button><div class="modal-header" data-v-ab7e9190><h3 data-v-ab7e9190>${ssrInterpolate($setup.selectedDay?.fullDate)}</h3>`);
    if ($setup.selectedDay && $setup.getDayStatus($setup.selectedDay)) {
      _push(`<span class="${
        ssrRenderClass([$setup.getDayStatus($setup.selectedDay), "day-status"])
      }" data-v-ab7e9190>${
        ssrInterpolate($setup.getDayStatus($setup.selectedDay) === 'completed' ? '已完成' : $setup.getDayStatus($setup.selectedDay) === 'today' ? '今日任务' : '待完成')
      }</span>`);
    } else {
      _push(`<!---->`);
    }
    if ($setup.selectedDay && $setup.selectedDay.tasks.length > 0 && $setup.selectedDay.tasks[0].isCustomDate) {
      _push(`<span class="custom-date-badge" data-v-ab7e9190> 📌 自定义 </span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
    if (!$setup.selectedDay || $setup.selectedDay.tasks.length === 0) {
      _push(`<div class="no-tasks" data-v-ab7e9190><div class="no-tasks-icon" data-v-ab7e9190>📅</div><p data-v-ab7e9190>暂无学习任务</p><p class="no-tasks-hint" data-v-ab7e9190>这是休息日，好好放松一下吧！</p></div>`);
    } else {
      _push(`<div class="task-list" data-v-ab7e9190><!--[-->`);
      ssrRenderList($setup.selectedDay.tasks, (task, taskIndex) => {
        _push(`<div class="task-detail" style="${
          ssrRenderStyle({ borderLeft: `4px solid ${task.color}` })
        }" data-v-ab7e9190><div class="task-header" data-v-ab7e9190><span class="task-phase" style="${
          ssrRenderStyle({ color: task.color })
        }" data-v-ab7e9190>${
          ssrInterpolate(task.phase)
        }</span><span class="task-duration" data-v-ab7e9190>⏱️ ${
          ssrInterpolate(task.duration)
        }</span></div><div class="task-title" data-v-ab7e9190>${
          ssrInterpolate(task.title)
        }</div><div class="task-desc" data-v-ab7e9190>${
          ssrInterpolate(task.description)
        }</div>`);
        if (task.materials) {
          _push(`<div class="task-materials" data-v-ab7e9190><span class="materials-icon" data-v-ab7e9190>📚</span><span data-v-ab7e9190>${ssrInterpolate(task.materials)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (task.exercises && task.exercises.length > 0) {
          _push(`<div class="exercises-section" data-v-ab7e9190><div class="exercises-header" data-v-ab7e9190>📝 今日练习</div><div class="exercises-list" data-v-ab7e9190><!--[-->`);
          ssrRenderList(task.exercises, (exercise, exIndex) => {
            _push(`<div class="${
              ssrRenderClass([{ completed: $setup.isExerciseCompleted($setup.selectedDay, taskIndex, exIndex) }, "exercise-item"])
            }" data-v-ab7e9190><span class="exercise-status" data-v-ab7e9190>${
              ssrInterpolate($setup.isExerciseCompleted($setup.selectedDay, taskIndex, exIndex) ? '✅' : '⬜')
            }</span><span class="exercise-type" style="${
              ssrRenderStyle({ backgroundColor: task.color + '20', color: task.color })
            }" data-v-ab7e9190>${
              ssrInterpolate(exercise.type)
            }</span><span class="exercise-name" data-v-ab7e9190>${
              ssrInterpolate(exercise.name)
            }</span><span class="exercise-quantity" data-v-ab7e9190><span class="quantity-done" data-v-ab7e9190>${
              ssrInterpolate($setup.getExerciseDone($setup.selectedDay, taskIndex, exIndex))
            }</span><span class="quantity-sep" data-v-ab7e9190>/</span><span class="quantity-total" data-v-ab7e9190>${
              ssrInterpolate(exercise.quantity)
            } ${
              ssrInterpolate(exercise.unit)
            }</span></span></div>`);
          });
          _push(`<!--]--></div><div class="task-progress-bar" data-v-ab7e9190><div class="progress-label" data-v-ab7e9190> 完成进度: ${
            ssrInterpolate($setup.getTaskCompletionPercent($setup.selectedDay, taskIndex))
          }% </div><div class="progress-track" data-v-ab7e9190><div class="progress-fill" style="${
            ssrRenderStyle({
                      width: $setup.getTaskCompletionPercent($setup.selectedDay, taskIndex) + '%',
                      backgroundColor: task.color
                    })
          }" data-v-ab7e9190></div></div></div></div>`);
        } else {
          _push(`<div class="task-completion-status" data-v-ab7e9190>`);
          if ($setup.isTaskCompleted($setup.selectedDay, taskIndex)) {
            _push(`<span class="status-completed" data-v-ab7e9190> ✅ 已完成 </span>`);
          } else {
            _push(`<span class="status-pending" data-v-ab7e9190> ⬜ 待完成 </span>`);
          }
          _push(`</div>`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="study-stats" data-v-ab7e9190><div class="stat-item" data-v-ab7e9190><span class="stat-value" data-v-ab7e9190>${
    ssrInterpolate($setup.totalDays)
  }</span><span class="stat-label" data-v-ab7e9190>总天数</span></div><div class="stat-item" data-v-ab7e9190><span class="stat-value" data-v-ab7e9190>${
    ssrInterpolate($setup.studyDaysCount)
  }</span><span class="stat-label" data-v-ab7e9190>学习日</span></div><div class="stat-item" data-v-ab7e9190><span class="stat-value" data-v-ab7e9190>${
    ssrInterpolate($setup.restDaysCount)
  }</span><span class="stat-label" data-v-ab7e9190>休息日</span></div><div class="stat-item" data-v-ab7e9190><span class="stat-value" data-v-ab7e9190>${
    ssrInterpolate($setup.progressPercent)
  }%</span><span class="stat-label" data-v-ab7e9190>进度</span></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext()
  ;(ssrContext.modules || (ssrContext.modules = new Set())).add("src/components/pte/StudyCalendar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined
};
const StudyCalendar = /*#__PURE__*/_export_sfc(_sfc_main, [['ssrRender',_sfc_ssrRender],['__scopeId',"data-v-ab7e9190"]]);

/*按日期配置学习计划，exercises 中的 completed 字段标记完成数量*/
/*第一周全勤，从第二周开始周三、周四休息，其余时间每天 5 小时*/
/*基础阶段：重点 RA, RS, WFD，穿插 DI, RL 和阅读*/
/*强化阶段：全题型涉猎*/
// ============ 第一阶段：基础夯实（第1-4周）============
// 重点：RA, RS, WFD，穿插 DI, RL 和阅读训练
// 练习量逐渐递增：WFD 5→20, RA/RS 5→20, DI 2→8, RL 1→5, 阅读 2→8
// 第1周 (01-05 周一 ~ 01-11 周日) - 全勤
// 2026-01-05 是周一
// 第2周 (01-12 周一 ~ 01-18 周日) - 周三01-14、周四01-15休息
// 01-12周一, 01-13周二, 跳过01-14周三/01-15周四, 01-16周五, 01-17周六, 01-18周日
// 第3周 (01-19 周一 ~ 01-25 周日) - 周三01-21、周四01-22休息
// 第4周 (01-26 周一 ~ 02-01 周日) - 周三01-28、周四01-29休息
// ============ 第二阶段：强化提升（第5-8周）============
// 全题型涉猎，均衡训练
// 第5周 (02-02 周一 ~ 02-08 周日) - 周三02-04、周四02-05休息
// 第6周 (02-09 周一 ~ 02-15 周日) - 周三02-11、周四02-12休息
// 第7周 (02-16 周一 ~ 02-22 周日) - 周三02-18、周四02-19休息
// 第8周 (02-23 周一 ~ 03-01 周日) - 周三02-25、周四02-26休息
// ============ 第三阶段：冲刺突破（第9-12周）============
// 机经冲刺，高频预测
// 第9周 (03-02 周一 ~ 03-08 周日) - 周三03-04、周四03-05休息
// 第10周 (03-09 周一 ~ 03-15 周日) - 周三03-11、周四03-12休息
// 第11周 (03-16 周一 ~ 03-22 周日) - 周三03-18、周四03-19休息
// 第12周 (03-23 周一 ~ 03-29 周日) - 周三03-25、周四03-26休息
const frontmatter = {
  "title": "PTE 三个月备考计划",
  "description": "系统化的 PTE 考试备考日历，分为基础、强化、冲刺三个阶段",
  "pubDate": "2025-01-07T00:00:00.000Z",
  "author": "Jet",
  "tags": ["PTE", "英语学习", "备考计划"],
  "categories": ["学习"]
};
function getHeadings() {
  return [{
    "depth": 1,
    "slug": "pte-三个月备考计划",
    "text": "PTE 三个月备考计划"
  }, {
    "depth": 2,
    "slug": "备考日历",
    "text": "备考日历"
  }, {
    "depth": 2,
    "slug": "三阶段学习策略",
    "text": "三阶段学习策略"
  }, {
    "depth": 3,
    "slug": "第一阶段基础夯实第-1-4-周",
    "text": "第一阶段：基础夯实（第 1-4 周）"
  }, {
    "depth": 3,
    "slug": "第二阶段强化提升第-5-8-周",
    "text": "第二阶段：强化提升（第 5-8 周）"
  }, {
    "depth": 3,
    "slug": "第三阶段冲刺突破第-9-12-周",
    "text": "第三阶段：冲刺突破（第 9-12 周）"
  }, {
    "depth": 2,
    "slug": "推荐学习资源",
    "text": "推荐学习资源"
  }, {
    "depth": 2,
    "slug": "考试当天注意事项",
    "text": "考试当天注意事项"
  }];
}
const ptePhases = [{
  id: 1,
  name: '基础阶段',
  color: '#10b981',
  weeks: 4
}, {
  id: 2,
  name: '强化阶段',
  color: '#3b82f6',
  weeks: 4
}, {
  id: 3,
  name: '冲刺阶段',
  color: '#f59e0b',
  weeks: 4
}];
const pteDateConfig = {
  // ============ 第一阶段：基础夯实（第1-4周）============
  // 重点：RA, RS, WFD，穿插 DI, RL 和阅读训练
  // 练习量逐渐递增：WFD 5→20, RA/RS 5→20, DI 2→8, RL 1→5, 阅读 2→8
  // 第1周 (01-05 周一 ~ 01-11 周日) - 全勤
  // 2026-01-05 是周一
  '2026-01-09': {
    phase: '基础阶段',
    title: 'RA/RS + RL 入门',
    duration: '5小时',
    description: 'RA/RS 练习，RL 笔记技巧学习',
    materials: 'APEUni WFD/RL 题库',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 7,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 7,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 1,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-10': {
    phase: '基础阶段',
    title: '周末综合练习',
    duration: '5小时',
    description: 'RA/RS/WFD 综合复习，阅读穿插',
    materials: 'APEUni、PTE Official',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-RW',
      name: 'Fill in the Blanks (R&W)',
      quantity: 2,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-11': {
    phase: '基础阶段',
    title: '周末综合练习',
    duration: '5小时',
    description: 'RA/RS/WFD 综合复习，DI/RL 穿插',
    materials: 'APEUni、PTE Official',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 2,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 1,
      unit: '题',
      completed: 0
    }]
  },
  // 第2周 (01-12 周一 ~ 01-18 周日) - 周三01-14、周四01-15休息
  // 01-12周一, 01-13周二, 跳过01-14周三/01-15周四, 01-16周五, 01-17周六, 01-18周日
  '2026-01-12': {
    phase: '基础阶段',
    title: 'RA/RS 提升',
    duration: '5小时',
    description: '口语核心题型练习提升',
    materials: 'APEUni、PTE Magic',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 9,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 9,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 9,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-13': {
    phase: '基础阶段',
    title: 'WFD + 阅读训练',
    duration: '5小时',
    description: 'WFD 听写练习，阅读技巧提升',
    materials: 'APEUni WFD/FIB 题库',
    exercises: [{
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-R',
      name: 'Fill in the Blanks (Reading)',
      quantity: 3,
      unit: '题',
      completed: 0
    }, {
      type: 'RO',
      name: 'Re-order Paragraphs',
      quantity: 3,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-16': {
    phase: '基础阶段',
    title: 'RA/RS + DI 练习',
    duration: '5小时',
    description: 'RA/RS 巩固，DI 模板练习',
    materials: 'APEUni',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 3,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-17': {
    phase: '基础阶段',
    title: 'WFD + RL 练习',
    duration: '5小时',
    description: 'WFD 巩固，RL 复述技巧',
    materials: 'APEUni WFD/RL 题库',
    exercises: [{
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 11,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 2,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 8,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-18': {
    phase: '基础阶段',
    title: '周末综合练习',
    duration: '5小时',
    description: '全面复习本周内容',
    materials: 'APEUni、PTE Official',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 11,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 11,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 11,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-RW',
      name: 'Fill in the Blanks (R&W)',
      quantity: 4,
      unit: '题',
      completed: 0
    }]
  },
  // 第3周 (01-19 周一 ~ 01-25 周日) - 周三01-21、周四01-22休息
  '2026-01-19': {
    phase: '基础阶段',
    title: 'RA/RS 强化',
    duration: '5小时',
    description: '口语核心题型强化训练',
    materials: 'APEUni、PTE Magic',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 12,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 12,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 12,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-20': {
    phase: '基础阶段',
    title: 'WFD + 阅读强化',
    duration: '5小时',
    description: 'WFD 听写强化，阅读综合练习',
    materials: 'APEUni',
    exercises: [{
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 13,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-R',
      name: 'Fill in the Blanks (Reading)',
      quantity: 5,
      unit: '题',
      completed: 0
    }, {
      type: 'RO',
      name: 'Re-order Paragraphs',
      quantity: 4,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-23': {
    phase: '基础阶段',
    title: 'RA/RS + DI 强化',
    duration: '5小时',
    description: 'RA/RS 精练，DI 各类图表练习',
    materials: 'APEUni',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 14,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 14,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 5,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-24': {
    phase: '基础阶段',
    title: 'WFD + RL 强化',
    duration: '5小时',
    description: 'WFD 巩固，RL 复述技巧强化',
    materials: 'APEUni WFD/RL 题库',
    exercises: [{
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 14,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 3,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 10,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-25': {
    phase: '基础阶段',
    title: '周末综合练习',
    duration: '5小时',
    description: '全面复习，模拟测试',
    materials: 'APEUni、PTE Official',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'Mock',
      name: '单模块模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }]
  },
  // 第4周 (01-26 周一 ~ 02-01 周日) - 周三01-28、周四01-29休息
  '2026-01-26': {
    phase: '基础阶段',
    title: 'RA/RS 巩固',
    duration: '5小时',
    description: '口语核心题型巩固训练',
    materials: 'APEUni、PTE Magic',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 16,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 16,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 16,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-27': {
    phase: '基础阶段',
    title: 'WFD + 阅读总结',
    duration: '5小时',
    description: 'WFD 听写，阅读技巧总结',
    materials: 'APEUni',
    exercises: [{
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 17,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-R',
      name: 'Fill in the Blanks (Reading)',
      quantity: 6,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-RW',
      name: 'Fill in the Blanks (R&W)',
      quantity: 6,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-30': {
    phase: '基础阶段',
    title: 'RA/RS + DI/RL',
    duration: '5小时',
    description: '口语综合强化',
    materials: 'APEUni',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 18,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 18,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 7,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 4,
      unit: '题',
      completed: 0
    }]
  },
  '2026-01-31': {
    phase: '基础阶段',
    title: '基础阶段总结',
    duration: '5小时',
    description: '基础阶段复习与模考',
    materials: 'PTE Official',
    exercises: [{
      type: 'Mock',
      name: '完整模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }, {
      type: 'Review',
      name: '错题复习',
      quantity: 15,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-01': {
    phase: '基础阶段',
    title: '基础阶段复盘',
    duration: '5小时',
    description: '模考分析，薄弱项梳理',
    materials: 'APEUni',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'Analysis',
      name: '模考分析',
      quantity: 1,
      unit: '次',
      completed: 0
    }]
  },
  // ============ 第二阶段：强化提升（第5-8周）============
  // 全题型涉猎，均衡训练
  // 第5周 (02-02 周一 ~ 02-08 周日) - 周三02-04、周四02-05休息
  '2026-02-02': {
    phase: '强化阶段',
    title: 'Speaking 全题型',
    duration: '5小时',
    description: '口语全题型训练',
    materials: 'APEUni、PTE Magic',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'ASQ',
      name: 'Answer Short Question',
      quantity: 20,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-03': {
    phase: '强化阶段',
    title: 'Writing 全题型',
    duration: '5小时',
    description: '写作全题型训练',
    materials: 'APEUni Essay/SWT',
    exercises: [{
      type: 'SWT',
      name: 'Summarize Written Text',
      quantity: 4,
      unit: '篇',
      completed: 0
    }, {
      type: 'Essay',
      name: 'Write Essay',
      quantity: 2,
      unit: '篇',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 30,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-06': {
    phase: '强化阶段',
    title: 'Reading 全题型',
    duration: '5小时',
    description: '阅读全题型训练',
    materials: 'APEUni Reading',
    exercises: [{
      type: 'FIB-RW',
      name: 'Fill in the Blanks (R&W)',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-R',
      name: 'Fill in the Blanks (Reading)',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'RO',
      name: 'Re-order Paragraphs',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'MCQ-R',
      name: 'Multiple Choice (Reading)',
      quantity: 10,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-07': {
    phase: '强化阶段',
    title: 'Listening 全题型',
    duration: '5小时',
    description: '听力全题型训练',
    materials: 'APEUni Listening',
    exercises: [{
      type: 'SST',
      name: 'Summarize Spoken Text',
      quantity: 3,
      unit: '篇',
      completed: 0
    }, {
      type: 'FIB-L',
      name: 'Fill in the Blanks (Listening)',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'HIW',
      name: 'Highlight Incorrect Words',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 30,
      unit: '题',
      completed: 0
    }, {
      type: 'MCQ-L',
      name: 'Multiple Choice (Listening)',
      quantity: 5,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-08': {
    phase: '强化阶段',
    title: '周末模考',
    duration: '5小时',
    description: '完整模拟考试',
    materials: 'PTE Official',
    exercises: [{
      type: 'Mock',
      name: '完整模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }, {
      type: 'Analysis',
      name: '错题分析',
      quantity: 1,
      unit: '次',
      completed: 0
    }]
  },
  // 第6周 (02-09 周一 ~ 02-15 周日) - 周三02-11、周四02-12休息
  '2026-02-09': {
    phase: '强化阶段',
    title: 'Speaking 全题型',
    duration: '5小时',
    description: '口语全题型强化',
    materials: 'APEUni、PTE Magic',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'ASQ',
      name: 'Answer Short Question',
      quantity: 20,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-10': {
    phase: '强化阶段',
    title: 'Writing + Listening',
    duration: '5小时',
    description: '写作与听力综合',
    materials: 'APEUni',
    exercises: [{
      type: 'SWT',
      name: 'Summarize Written Text',
      quantity: 3,
      unit: '篇',
      completed: 0
    }, {
      type: 'Essay',
      name: 'Write Essay',
      quantity: 2,
      unit: '篇',
      completed: 0
    }, {
      type: 'SST',
      name: 'Summarize Spoken Text',
      quantity: 3,
      unit: '篇',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 25,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-13': {
    phase: '强化阶段',
    title: 'Reading + Speaking',
    duration: '5小时',
    description: '阅读与口语综合',
    materials: 'APEUni',
    exercises: [{
      type: 'FIB-RW',
      name: 'Fill in the Blanks (R&W)',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-R',
      name: 'Fill in the Blanks (Reading)',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'RA',
      name: 'Read Aloud',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 20,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-14': {
    phase: '强化阶段',
    title: 'Listening 强化',
    duration: '5小时',
    description: '听力全题型强化',
    materials: 'APEUni Listening',
    exercises: [{
      type: 'SST',
      name: 'Summarize Spoken Text',
      quantity: 3,
      unit: '篇',
      completed: 0
    }, {
      type: 'FIB-L',
      name: 'Fill in the Blanks (Listening)',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'HIW',
      name: 'Highlight Incorrect Words',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 35,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-15': {
    phase: '强化阶段',
    title: '周末模考',
    duration: '5小时',
    description: '完整模拟考试',
    materials: 'PTE Official',
    exercises: [{
      type: 'Mock',
      name: '完整模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }, {
      type: 'Analysis',
      name: '错题分析',
      quantity: 1,
      unit: '次',
      completed: 0
    }]
  },
  // 第7周 (02-16 周一 ~ 02-22 周日) - 周三02-18、周四02-19休息
  '2026-02-16': {
    phase: '强化阶段',
    title: 'Speaking 全题型',
    duration: '5小时',
    description: '口语全题型精练',
    materials: 'APEUni、PTE Magic',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'ASQ',
      name: 'Answer Short Question',
      quantity: 20,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-17': {
    phase: '强化阶段',
    title: 'Writing 全题型',
    duration: '5小时',
    description: '写作全题型精练',
    materials: 'APEUni Essay/SWT',
    exercises: [{
      type: 'SWT',
      name: 'Summarize Written Text',
      quantity: 4,
      unit: '篇',
      completed: 0
    }, {
      type: 'Essay',
      name: 'Write Essay',
      quantity: 2,
      unit: '篇',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 30,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-20': {
    phase: '强化阶段',
    title: 'Reading 全题型',
    duration: '5小时',
    description: '阅读全题型精练',
    materials: 'APEUni Reading',
    exercises: [{
      type: 'FIB-RW',
      name: 'Fill in the Blanks (R&W)',
      quantity: 12,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-R',
      name: 'Fill in the Blanks (Reading)',
      quantity: 12,
      unit: '题',
      completed: 0
    }, {
      type: 'RO',
      name: 'Re-order Paragraphs',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'MCQ-R',
      name: 'Multiple Choice (Reading)',
      quantity: 10,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-21': {
    phase: '强化阶段',
    title: 'Listening 全题型',
    duration: '5小时',
    description: '听力全题型精练',
    materials: 'APEUni Listening',
    exercises: [{
      type: 'SST',
      name: 'Summarize Spoken Text',
      quantity: 4,
      unit: '篇',
      completed: 0
    }, {
      type: 'FIB-L',
      name: 'Fill in the Blanks (Listening)',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'HIW',
      name: 'Highlight Incorrect Words',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 35,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-22': {
    phase: '强化阶段',
    title: '周末模考',
    duration: '5小时',
    description: '完整模拟考试与复盘',
    materials: 'PTE Official',
    exercises: [{
      type: 'Mock',
      name: '完整模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }, {
      type: 'Analysis',
      name: '深度复盘',
      quantity: 1,
      unit: '次',
      completed: 0
    }]
  },
  // 第8周 (02-23 周一 ~ 03-01 周日) - 周三02-25、周四02-26休息
  '2026-02-23': {
    phase: '强化阶段',
    title: 'Speaking 全题型',
    duration: '5小时',
    description: '口语全题型冲刺',
    materials: 'APEUni、PTE Magic',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 25,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'Retell Lecture',
      quantity: 8,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-24': {
    phase: '强化阶段',
    title: '综合训练',
    duration: '5小时',
    description: '四大模块综合',
    materials: 'APEUni',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 25,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-RW',
      name: 'Fill in the Blanks (R&W)',
      quantity: 8,
      unit: '题',
      completed: 0
    }, {
      type: 'SST',
      name: 'Summarize Spoken Text',
      quantity: 2,
      unit: '篇',
      completed: 0
    }]
  },
  '2026-02-27': {
    phase: '强化阶段',
    title: '强化阶段总结',
    duration: '5小时',
    description: '强化阶段复习与模考',
    materials: 'PTE Official',
    exercises: [{
      type: 'Mock',
      name: '完整模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }, {
      type: 'Review',
      name: '错题复习',
      quantity: 40,
      unit: '题',
      completed: 0
    }]
  },
  '2026-02-28': {
    phase: '强化阶段',
    title: '强化阶段复盘',
    duration: '5小时',
    description: '模考分析，薄弱项强化',
    materials: 'APEUni',
    exercises: [{
      type: 'Weak',
      name: '薄弱题型练习',
      quantity: 30,
      unit: '题',
      completed: 0
    }, {
      type: 'Analysis',
      name: '模考分析',
      quantity: 1,
      unit: '次',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 30,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-01': {
    phase: '强化阶段',
    title: '综合复习',
    duration: '5小时',
    description: '全题型综合复习',
    materials: 'APEUni',
    exercises: [{
      type: 'RA',
      name: 'Read Aloud',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'Repeat Sentence',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'Describe Image',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'Write From Dictation',
      quantity: 30,
      unit: '题',
      completed: 0
    }]
  },
  // ============ 第三阶段：冲刺突破（第9-12周）============
  // 机经冲刺，高频预测
  // 第9周 (03-02 周一 ~ 03-08 周日) - 周三03-04、周四03-05休息
  '2026-03-02': {
    phase: '冲刺阶段',
    title: '高频机经冲刺',
    duration: '5小时',
    description: 'WFD/RA/RS 高频机经',
    materials: 'APEUni 机经、羊驼 PTE',
    exercises: [{
      type: 'WFD',
      name: 'WFD 高频机经',
      quantity: 50,
      unit: '题',
      completed: 0
    }, {
      type: 'RA',
      name: 'RA 高频预测',
      quantity: 25,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'RS 高频预测',
      quantity: 25,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-03': {
    phase: '冲刺阶段',
    title: 'Speaking 机经',
    duration: '5小时',
    description: 'DI/RL/ASQ 机经冲刺',
    materials: 'APEUni 预测题',
    exercises: [{
      type: 'DI',
      name: 'DI 高频预测',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'RL 高频预测',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'ASQ',
      name: 'ASQ 高频',
      quantity: 30,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-06': {
    phase: '冲刺阶段',
    title: 'Reading 机经',
    duration: '5小时',
    description: '阅读机经冲刺',
    materials: 'APEUni 机经题库',
    exercises: [{
      type: 'FIB-RW',
      name: 'FIB-RW 高频',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-R',
      name: 'FIB-R 高频',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RO',
      name: 'RO 高频',
      quantity: 15,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-07': {
    phase: '冲刺阶段',
    title: 'Listening 机经',
    duration: '5小时',
    description: '听力机经冲刺',
    materials: 'APEUni 机经题库',
    exercises: [{
      type: 'SST',
      name: 'SST 高频',
      quantity: 5,
      unit: '篇',
      completed: 0
    }, {
      type: 'HIW',
      name: 'HIW 高频',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'WFD 高频',
      quantity: 40,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-08': {
    phase: '冲刺阶段',
    title: '周末全真模考',
    duration: '5小时',
    description: '全真模拟考试',
    materials: 'PTE Official',
    exercises: [{
      type: 'Mock',
      name: '全真模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }, {
      type: 'Analysis',
      name: '深度复盘',
      quantity: 1,
      unit: '次',
      completed: 0
    }]
  },
  // 第10周 (03-09 周一 ~ 03-15 周日) - 周三03-11、周四03-12休息
  '2026-03-09': {
    phase: '冲刺阶段',
    title: '高频机经冲刺',
    duration: '5小时',
    description: 'WFD/RA/RS 机经巩固',
    materials: 'APEUni 机经、羊驼 PTE',
    exercises: [{
      type: 'WFD',
      name: 'WFD 高频机经',
      quantity: 50,
      unit: '题',
      completed: 0
    }, {
      type: 'RA',
      name: 'RA 高频预测',
      quantity: 25,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'RS 高频预测',
      quantity: 25,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-10': {
    phase: '冲刺阶段',
    title: 'Speaking 机经',
    duration: '5小时',
    description: 'DI/RL 机经强化',
    materials: 'APEUni 预测题',
    exercises: [{
      type: 'DI',
      name: 'DI 高频预测',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'RL 高频预测',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'ASQ',
      name: 'ASQ 高频',
      quantity: 30,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-13': {
    phase: '冲刺阶段',
    title: 'Reading + Writing',
    duration: '5小时',
    description: '阅读写作机经',
    materials: 'APEUni 机经',
    exercises: [{
      type: 'FIB-RW',
      name: 'FIB-RW 高频',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'SWT',
      name: 'SWT 高频',
      quantity: 4,
      unit: '篇',
      completed: 0
    }, {
      type: 'Essay',
      name: 'Essay 预测',
      quantity: 2,
      unit: '篇',
      completed: 0
    }]
  },
  '2026-03-14': {
    phase: '冲刺阶段',
    title: 'Listening 机经',
    duration: '5小时',
    description: '听力机经强化',
    materials: 'APEUni 机经题库',
    exercises: [{
      type: 'SST',
      name: 'SST 高频',
      quantity: 5,
      unit: '篇',
      completed: 0
    }, {
      type: 'HIW',
      name: 'HIW 高频',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'WFD 高频',
      quantity: 40,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-15': {
    phase: '冲刺阶段',
    title: '周末全真模考',
    duration: '5小时',
    description: '全真模拟考试',
    materials: 'PTE Official',
    exercises: [{
      type: 'Mock',
      name: '全真模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }, {
      type: 'Analysis',
      name: '深度复盘',
      quantity: 1,
      unit: '次',
      completed: 0
    }]
  },
  // 第11周 (03-16 周一 ~ 03-22 周日) - 周三03-18、周四03-19休息
  '2026-03-16': {
    phase: '冲刺阶段',
    title: '高频机经冲刺',
    duration: '5小时',
    description: 'WFD/RA/RS 最终冲刺',
    materials: 'APEUni 机经',
    exercises: [{
      type: 'WFD',
      name: 'WFD 高频机经',
      quantity: 50,
      unit: '题',
      completed: 0
    }, {
      type: 'RA',
      name: 'RA 高频预测',
      quantity: 25,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'RS 高频预测',
      quantity: 25,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-17': {
    phase: '冲刺阶段',
    title: 'Speaking 冲刺',
    duration: '5小时',
    description: '口语最终冲刺',
    materials: 'APEUni 预测题',
    exercises: [{
      type: 'DI',
      name: 'DI 高频预测',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'RL',
      name: 'RL 高频预测',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'RA',
      name: 'RA 热身',
      quantity: 15,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-20': {
    phase: '冲刺阶段',
    title: '综合冲刺',
    duration: '5小时',
    description: '全题型最终冲刺',
    materials: 'APEUni 机经',
    exercises: [{
      type: 'WFD',
      name: 'WFD 高频',
      quantity: 40,
      unit: '题',
      completed: 0
    }, {
      type: 'FIB-RW',
      name: 'FIB-RW 高频',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'SST',
      name: 'SST 高频',
      quantity: 3,
      unit: '篇',
      completed: 0
    }]
  },
  '2026-03-21': {
    phase: '冲刺阶段',
    title: '薄弱项强化',
    duration: '5小时',
    description: '针对性训练薄弱项',
    materials: '根据模考分析选择',
    exercises: [{
      type: 'Weak',
      name: '薄弱题型练习',
      quantity: 40,
      unit: '题',
      completed: 0
    }, {
      type: 'Review',
      name: '错题三刷',
      quantity: 30,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-22': {
    phase: '冲刺阶段',
    title: '周末全真模考',
    duration: '5小时',
    description: '考前模拟',
    materials: 'PTE Official',
    exercises: [{
      type: 'Mock',
      name: '全真模考',
      quantity: 1,
      unit: '套',
      completed: 0
    }, {
      type: 'Analysis',
      name: '最终复盘',
      quantity: 1,
      unit: '次',
      completed: 0
    }]
  },
  // 第12周 (03-23 周一 ~ 03-29 周日) - 周三03-25、周四03-26休息
  '2026-03-23': {
    phase: '冲刺阶段',
    title: '考前冲刺',
    duration: '5小时',
    description: 'WFD/RA/RS 最后冲刺',
    materials: 'APEUni 机经',
    exercises: [{
      type: 'WFD',
      name: 'WFD 高频机经',
      quantity: 50,
      unit: '题',
      completed: 0
    }, {
      type: 'RA',
      name: 'RA 高频',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'RS 高频',
      quantity: 20,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-24': {
    phase: '冲刺阶段',
    title: '考前复习',
    duration: '5小时',
    description: '全题型轻量复习',
    materials: 'APEUni',
    exercises: [{
      type: 'RA',
      name: 'RA 热身',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'RS 热身',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'WFD 复习',
      quantity: 30,
      unit: '题',
      completed: 0
    }, {
      type: 'DI',
      name: 'DI 热身',
      quantity: 10,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-27': {
    phase: '冲刺阶段',
    title: '考前热身',
    duration: '5小时',
    description: '保持手感',
    materials: 'APEUni',
    exercises: [{
      type: 'RA',
      name: 'RA 热身',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'RS 热身',
      quantity: 20,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'WFD 热身',
      quantity: 30,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-28': {
    phase: '冲刺阶段',
    title: '考前最后冲刺',
    duration: '5小时',
    description: '轻松复习，调整心态',
    materials: '错题本、高频机经',
    exercises: [{
      type: 'WFD',
      name: 'WFD 高频复习',
      quantity: 30,
      unit: '题',
      completed: 0
    }, {
      type: 'RA',
      name: 'RA 热身',
      quantity: 15,
      unit: '题',
      completed: 0
    }, {
      type: 'RS',
      name: 'RS 热身',
      quantity: 15,
      unit: '题',
      completed: 0
    }]
  },
  '2026-03-29': {
    phase: '冲刺阶段',
    title: '考前休息',
    duration: '3小时',
    description: '轻量复习，充分休息',
    materials: '高频机经',
    exercises: [{
      type: 'RA',
      name: 'RA 轻量热身',
      quantity: 10,
      unit: '题',
      completed: 0
    }, {
      type: 'WFD',
      name: 'WFD 轻量复习',
      quantity: 20,
      unit: '题',
      completed: 0
    }]
  }
};
function _createMdxContent(props) {
  const _components = {
    button: "button",
    div: "div",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    hr: "hr",
    li: "li",
    ol: "ol",
    p: "p",
    strong: "strong",
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ul: "ul",
    ...props.components
  };
  return createVNode(Fragment, {
    children: ["\n", "\n", "\n", "\n", "\n", createVNode(_components.h1, {
      id: "pte-三个月备考计划",
      children: "PTE 三个月备考计划"
    }), "\n", createVNode(_components.p, {
      children: "系统化的备考安排，帮助你高效准备 PTE 考试。"
    }), "\n", createVNode(_components.h2, {
      id: "备考日历",
      children: "备考日历"
    }), "\n", createVNode(_components.p, {
      children: "点击日期查看当天的学习任务详情。"
    }), "\n", createVNode(StudyCalendar, {
      "client:load": true,
      phases: ptePhases,
      dateConfig: pteDateConfig,
      startDate: "2026-01-05",
      title: "PTE 备考日历",
      "client:component-path": "@/components/pte/StudyCalendar.vue",
      "client:component-export": "default",
      "client:component-hydration": true
    }), "\n", createVNode(_components.hr, {}), "\n", createVNode(_components.h2, {
      id: "三阶段学习策略",
      children: "三阶段学习策略"
    }), "\n", createVNode(_components.h3, {
      id: "第一阶段基础夯实第-1-4-周",
      children: "第一阶段：基础夯实（第 1-4 周）"
    }), "\n", createVNode(_components.p, {
      children: [createVNode(_components.strong, {
        children: "目标"
      }), "：熟悉核心题型，建立发音基础"]
    }), "\n", createVNode(_components.p, {
      children: [createVNode(_components.strong, {
        children: "时间安排"
      }), "：每天 5 小时，第一周全勤，第二周起周三、周四休息"]
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "题型"
          }), createVNode(_components.th, {
            children: "重点内容"
          }), createVNode(_components.th, {
            children: "练习量"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "RA (Read Aloud)"
          }), createVNode(_components.td, {
            children: "发音基础，跟读练习"
          }), createVNode(_components.td, {
            children: "5→20 题/天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "RS (Repeat Sentence)"
          }), createVNode(_components.td, {
            children: "听力复述，短期记忆"
          }), createVNode(_components.td, {
            children: "5→20 题/天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "WFD (Write From Dictation)"
          }), createVNode(_components.td, {
            children: "听写训练，拼写准确"
          }), createVNode(_components.td, {
            children: "5→20 题/天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "DI (Describe Image)"
          }), createVNode(_components.td, {
            children: "模板学习，图表描述"
          }), createVNode(_components.td, {
            children: "2→8 题/天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "RL (Retell Lecture)"
          }), createVNode(_components.td, {
            children: "笔记技巧，复述要点"
          }), createVNode(_components.td, {
            children: "1→5 题/天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "阅读 (FIB-R/RO)"
          }), createVNode(_components.td, {
            children: "逻辑训练，词汇积累"
          }), createVNode(_components.td, {
            children: "2→8 题/天"
          })]
        })]
      })]
    }), "\n", createVNode(_components.div, {
      class: "container-tip custom-container",
      "data-container-type": "tip",
      children: ["\n", createVNode(_components.div, {
        class: "container-title",
        children: "基础阶段建议"
      }), "\n", createVNode(_components.div, {
        class: "container-content",
        children: ["\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "重点攻克 RA、RS、WFD 三大核心题型"
          }), "\n", createVNode(_components.li, {
            children: "练习量逐周递增，循序渐进"
          }), "\n", createVNode(_components.li, {
            children: "跟读时录音对比，纠正发音问题"
          }), "\n", createVNode(_components.li, {
            children: "第 4 周末进行首次完整模考"
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.hr, {}), "\n", createVNode(_components.h3, {
      id: "第二阶段强化提升第-5-8-周",
      children: "第二阶段：强化提升（第 5-8 周）"
    }), "\n", createVNode(_components.p, {
      children: [createVNode(_components.strong, {
        children: "目标"
      }), "：全题型涉猎，均衡训练"]
    }), "\n", createVNode(_components.p, {
      children: [createVNode(_components.strong, {
        children: "时间安排"
      }), "：每天 5 小时，周三、周四休息，周末模考"]
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "模块"
          }), createVNode(_components.th, {
            children: "题型"
          }), createVNode(_components.th, {
            children: "练习量"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "Speaking"
          }), createVNode(_components.td, {
            children: "RA/RS/DI/RL/ASQ 全题型"
          }), createVNode(_components.td, {
            children: "每天综合练习"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "Writing"
          }), createVNode(_components.td, {
            children: "SWT 3-4 篇 + Essay 2 篇 + WFD 25-35 题"
          }), createVNode(_components.td, {
            children: "每周 2 天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "Reading"
          }), createVNode(_components.td, {
            children: "FIB-RW/FIB-R/RO/MCQ 全题型"
          }), createVNode(_components.td, {
            children: "每周 2 天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "Listening"
          }), createVNode(_components.td, {
            children: "SST 3-4 篇 + FIB-L + HIW + WFD"
          }), createVNode(_components.td, {
            children: "每周 2 天"
          })]
        })]
      })]
    }), "\n", createVNode(_components.div, {
      class: "container-warning custom-container",
      "data-container-type": "warning",
      children: ["\n", createVNode(_components.div, {
        class: "container-title",
        children: "强化阶段注意"
      }), "\n", createVNode(_components.div, {
        class: "container-content",
        children: ["\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "按模块轮换训练，全面覆盖所有题型"
          }), "\n", createVNode(_components.li, {
            children: "每周末进行完整模考，检验学习效果"
          }), "\n", createVNode(_components.li, {
            children: "建立错题本，记录易错点和薄弱项"
          }), "\n", createVNode(_components.li, {
            children: "第 8 周末深度复盘，为冲刺阶段做准备"
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.hr, {}), "\n", createVNode(_components.h3, {
      id: "第三阶段冲刺突破第-9-12-周",
      children: "第三阶段：冲刺突破（第 9-12 周）"
    }), "\n", createVNode(_components.p, {
      children: [createVNode(_components.strong, {
        children: "目标"
      }), "：机经冲刺，高频预测"]
    }), "\n", createVNode(_components.p, {
      children: [createVNode(_components.strong, {
        children: "时间安排"
      }), "：每天 5 小时（最后一天 3 小时），周三、周四休息"]
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "重点"
          }), createVNode(_components.th, {
            children: "内容"
          }), createVNode(_components.th, {
            children: "练习量"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "WFD 高频"
          }), createVNode(_components.td, {
            children: "机经题库刷题"
          }), createVNode(_components.td, {
            children: "40-50 题/天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "RA/RS 预测"
          }), createVNode(_components.td, {
            children: "高频预测题"
          }), createVNode(_components.td, {
            children: "各 20-25 题/天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "DI/RL 机经"
          }), createVNode(_components.td, {
            children: "高频图表和讲座"
          }), createVNode(_components.td, {
            children: "DI 20 题 + RL 10 题"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "Reading 机经"
          }), createVNode(_components.td, {
            children: "FIB-RW/FIB-R/RO 高频"
          }), createVNode(_components.td, {
            children: "各 15 题/天"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "Listening 机经"
          }), createVNode(_components.td, {
            children: "SST/HIW 高频"
          }), createVNode(_components.td, {
            children: "SST 5 篇 + HIW 15 题"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: "模考"
          }), createVNode(_components.td, {
            children: "全真模拟"
          }), createVNode(_components.td, {
            children: "每周 1 次"
          })]
        })]
      })]
    }), "\n", createVNode(_components.div, {
      class: "container-danger custom-container",
      "data-container-type": "danger",
      children: ["\n", createVNode(_components.div, {
        class: "container-title",
        children: "冲刺阶段提醒"
      }), "\n", createVNode(_components.div, {
        class: "container-content",
        children: ["\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "机经命中率高，集中刷高频预测题"
          }), "\n", createVNode(_components.li, {
            children: "每周至少一次全真模考，保持手感"
          }), "\n", createVNode(_components.li, {
            children: "针对薄弱项进行专项强化训练"
          }), "\n", createVNode(_components.li, {
            children: "考前 2 天轻量复习，调整作息和心态"
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.hr, {}), "\n", createVNode(_components.h2, {
      id: "推荐学习资源",
      children: "推荐学习资源"
    }), "\n", createVNode(_components.div, {
      class: "custom-tabs",
      "data-tabs-id": "tabs-a6gd0cuni",
      children: [createVNode(_components.div, {
        class: "tabs-header",
        children: [createVNode(_components.button, {
          class: "tab-button active",
          "data-tab-index": "0",
          onclick: "switchTab('tabs-a6gd0cuni', 0)",
          children: "官方资源"
        }), createVNode(_components.button, {
          class: "tab-button",
          "data-tab-index": "1",
          onclick: "switchTab('tabs-a6gd0cuni', 1)",
          children: "第三方平台"
        }), createVNode(_components.button, {
          class: "tab-button",
          "data-tab-index": "2",
          onclick: "switchTab('tabs-a6gd0cuni', 2)",
          children: "词汇工具"
        })]
      }), createVNode(_components.div, {
        class: "tabs-content",
        children: [createVNode(_components.div, {
          class: "tab-panel active",
          "data-tab-panel": "0",
          children: createVNode(_components.ul, {
            children: ["\n", createVNode(_components.li, {
              children: [createVNode(_components.strong, {
                children: "PTE Official"
              }), " - 官方模拟题"]
            }), "\n", createVNode(_components.li, {
              children: [createVNode(_components.strong, {
                children: "Scored Practice Test"
              }), " - 官方评分测试"]
            }), "\n"]
          })
        }), createVNode(_components.div, {
          class: "tab-panel",
          "data-tab-panel": "1",
          children: createVNode(_components.ul, {
            children: ["\n", createVNode(_components.li, {
              children: [createVNode(_components.strong, {
                children: "APEUni"
              }), " - 免费题库 + 机经"]
            }), "\n", createVNode(_components.li, {
              children: [createVNode(_components.strong, {
                children: "PTE Magic"
              }), " - 口语评分"]
            }), "\n", createVNode(_components.li, {
              children: [createVNode(_components.strong, {
                children: "羊驼 PTE"
              }), " - 中文社区"]
            }), "\n"]
          })
        }), createVNode(_components.div, {
          class: "tab-panel",
          "data-tab-panel": "2",
          children: createVNode(_components.ul, {
            children: ["\n", createVNode(_components.li, {
              children: [createVNode(_components.strong, {
                children: "Anki"
              }), " - 间隔重复记忆"]
            }), "\n", createVNode(_components.li, {
              children: [createVNode(_components.strong, {
                children: "墨墨背单词"
              }), " - 科学记忆曲线"]
            }), "\n"]
          })
        })]
      })]
    }), "\n", createVNode(_components.hr, {}), "\n", createVNode(_components.h2, {
      id: "考试当天注意事项",
      children: "考试当天注意事项"
    }), "\n", createVNode(_components.div, {
      class: "container-note custom-container",
      "data-container-type": "note",
      children: ["\n", createVNode(_components.div, {
        class: "container-title",
        children: "考前准备"
      }), "\n", createVNode(_components.div, {
        class: "container-content",
        children: ["\n", createVNode(_components.ol, {
          children: ["\n", createVNode(_components.li, {
            children: "提前 30 分钟到达考场"
          }), "\n", createVNode(_components.li, {
            children: "携带有效护照（原件）"
          }), "\n", createVNode(_components.li, {
            children: "不要携带手机进入考场"
          }), "\n", createVNode(_components.li, {
            children: "提前熟悉考场位置"
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.div, {
      class: "container-tip custom-container",
      "data-container-type": "tip",
      children: ["\n", createVNode(_components.div, {
        class: "container-title",
        children: "考试技巧"
      }), "\n", createVNode(_components.div, {
        class: "container-content",
        children: ["\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "口语部分说话时靠近麦克风"
          }), "\n", createVNode(_components.li, {
            children: "遇到不会的题不要纠结，及时跳过"
          }), "\n", createVNode(_components.li, {
            children: "保持专注，不要被周围考生影响"
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.hr, {}), "\n", createVNode(_components.p, {
      children: "祝你 PTE 考试顺利，早日达到目标分数！"
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

const url = "content/posts/PTE/pte.mdx";
const file = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/posts/PTE/pte.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/posts/PTE/pte.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, pteDateConfig, ptePhases, url };
