import { KnowledgeBase, ToolItem, ChatSession } from './types';

export const initialKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-1',
    name: '企业财务与行政管理规范',
    description: '汇集了2026年最新修订的企业财务报销标准、差旅管理制度、考勤与带薪年假相关细则。',
    docCount: 3,
    updatedAt: '2026-06-10 16:30',
    docs: [
      {
        id: 'doc-1-1',
        name: '员工差旅及业务招待费报销管理规定(2026版).pdf',
        size: '1.2 MB',
        status: 'ready',
        progress: 100,
        uploadedAt: '2026-06-08 09:12',
        chunks: [
          {
            id: 'chunk-1-1-1',
            index: 1,
            charCount: 228,
            content: '一、差旅住宿及交通标准：全体正式员工在国内出差时应当优先选择经济。标准划分为三类城市。一类城市（北京、上海、广州、深圳、杭州）住宿标准上限为 550 元/间/夜；二类城市（除一类外的省会城市、计划单列市）标准上限为 400 元/间/夜；三类城市（其他地级市）上限为 300 元/间/夜。'
          },
          {
            id: 'chunk-1-1-2',
            index: 2,
            charCount: 265,
            content: '二、差旅伙食及市内交通补贴：伙食补助按出差自然天数计算。一类城市每人每天伙食限额补贴标准为 120 元（北京、上海特别执行 150 元/天标准）；二类城市为 100 元/天；三类城市为 80 元/天。市内交通每人每天定额补贴为 80 元，凭发票据实报销，超出定额部分不予核销。公用包车或招待用车期间取消交通补贴。'
          },
          {
            id: 'chunk-1-1-3',
            index: 3,
            charCount: 195,
            content: '三、招待费报销审批：凡发生业务招待费用，须提前在OA系统发起接待申请。单次接待费用在 2000 元以下的，需部门总监审批；2000元至 10000 元的，需分管 VP 审批；超过 10000 元的由 CEO 一签审批。报销时必须附带OA接待审批单及明细餐饮账单。'
          }
        ]
      },
      {
        id: 'doc-1-2',
        name: '行政年假与福利度休规范2026.docx',
        size: '840 KB',
        status: 'ready',
        progress: 100,
        uploadedAt: '2026-06-08 10:25',
        chunks: [
          {
            id: 'chunk-1-2-1',
            index: 1,
            charCount: 210,
            content: '一、带薪年假：员工自入职满 1 年起享有带薪年假，具体额度为：已满 1 年不满 10 年者，年假为 5 天；已满 10 年不满 20 年者，年假为 10 天；年满 20 年及以上者，年假为 15 天。年休假在当年底必须使用完毕，如遇特殊项目工作需要，经 HRVP/总经理特别准许后可最多顺延 3 个月至次年 3 月 31 日前清零。'
          },
          {
            id: 'chunk-1-2-2',
            index: 2,
            charCount: 178,
            content: '二、法定病假与全薪病假：员工因病请假，每自然年度享有 3 天的全薪病假，请全薪病假无需提供二级医院诊断材料，但需提前半天在系统报备。超过 3 天的病假，按照国家标准及基本工资的 80% 计发。单次连续病假 3 天（含）以上，须在返岗后 2 个工作日内向行政人事部提交二级及以上公立医院出具的有效病历、诊断书。'
          }
        ]
      },
      {
        id: 'doc-1-3',
        name: '2026年营销推广费用分摊计划白皮书.pdf',
        size: '4.5 MB',
        status: 'processing',
        progress: 68,
        uploadedAt: '2026-06-11 02:20',
        chunks: []
      }
    ]
  },
  {
    id: 'kb-2',
    name: 'AI 客户服务通用服务规范与知识库',
    description: '机器人客服及人工支持团队的日常应答 SOP、退换货争议解决机制以及客诉等级划分标准。',
    docCount: 2,
    updatedAt: '2026-06-09 11:45',
    docs: [
      {
        id: 'doc-2-1',
        name: '售后退换货服务细则说明书.pdf',
        size: '950 KB',
        status: 'ready',
        progress: 100,
        uploadedAt: '2026-06-09 11:10',
        chunks: [
          {
            id: 'chunk-2-1-1',
            index: 1,
            charCount: 247,
            content: '1. 七天无理由退货标准：自消费者签收商品次日起七日内，在不影响商品二次销售的情况下（即外包装完整、配件齐全、标签未撕毁、无使用或物理摩擦痕迹），支持无理由退货。非质量问题引起的退货，来回寄送运费均由消费者自行承担。特殊类商品（如定制产品、贴身衣物、数字化虚拟软件等）除外。'
          },
          {
            id: 'chunk-2-1-2',
            index: 2,
            charCount: 204,
            content: '2. 质量问题退换标准：消费者在收到货物 15 日内如发现质量缺陷，可在线拍照上传。经售后工程师远程核定或返厂检测确属主板组件、内部元器件非人为缺陷损坏。可申请“以旧换新”服务，期间产生的全部物流费用及检测鉴定费用一律由公司财务代缴并予以报销。'
          }
        ]
      },
      {
        id: 'doc-2-2',
        name: '海外跨境结算及双清纠纷FAQ.txt',
        size: '310 KB',
        status: 'failed',
        progress: 45,
        uploadedAt: '2026-06-09 11:25',
        chunks: []
      }
    ]
  }
];

export const initialTools: ToolItem[] = [
  {
    id: 'tool-1',
    name: '企业 ERP 数据库检索',
    icon: 'Database',
    description: '通过传入商品编码或合同 ID，直接访问企业 ERP 核心数据库，查询当前的库存余量、采购底价或销售履约状态。',
    enabled: true,
    endpoint: 'https://api.internal.corp/erp/v2/query',
    schema: JSON.stringify({
      type: "object",
      properties: {
        query_type: { type: "string", description: "查询类型：inventory(库存) 或 contract(合同)" },
        item_code: { type: "string", description: "商品唯一SPU编码，如 SKU-908" },
        contract_id: { type: "string", description: "项目合同编号，格式类似 CON-Y2026-009" }
      },
      required: ["query_type"]
    }, null, 2)
  },
  {
    id: 'tool-2',
    name: '钉钉实时通知推送机器人',
    icon: 'Send',
    description: '向指定业务线钉钉群聊或具体责任人直接推送高度定制化的卡片消息，包含报备、审批流转状态修改及重大告警通知。',
    enabled: true,
    endpoint: 'https://oapi.dingtalk.com/robot/send?access_token=66ef92',
    schema: JSON.stringify({
      type: "object",
      properties: {
        chat_id: { type: "string", description: "目标推送的群组聊天ID" },
        title: { type: "string", description: "通知标题" },
        content_markdown: { type: "string", description: "采用Markdown格式包装的消息详细实体" },
        priority: { type: "string", enum: ["low", "normal", "high"], description: "消息等级" }
      },
      required: ["title", "content_markdown"]
    }, null, 2)
  },
  {
    id: 'tool-3',
    name: '谷歌 SERP 互联网搜索增强',
    icon: 'Globe',
    description: '在线检索当前最新互联网实时资讯、宏观政策调整或竞品价格变动，弥补并更新大模型无法获取的时效性知识。',
    enabled: true,
    endpoint: 'https://serp.googleapi.com/query',
    schema: JSON.stringify({
      type: "object",
      properties: {
        search_query: { type: "string", description: "检索关键词，如: 'DeepSeek-V3最新测试性能对比'" },
        search_type: { type: "string", enum: ["news", "general", "finance"], description: "搜索过滤维度" }
      },
      required: ["search_query"]
    }, null, 2)
  },
  {
    id: 'tool-4',
    name: '多语言情感及关键词归类器',
    icon: 'Languages',
    description: '对上传的客诉文本或销售对话日志进行分词深度情感聚类，智能打上核心倾向性标签，自动划拨到特定工单板块。',
    enabled: false,
    endpoint: 'https://api.nlp.internal/tagging',
    schema: JSON.stringify({
      type: "object",
      properties: {
        text_content: { type: "string", description: "待评测分类长文本" },
        language: { type: "string", default: "zh-CN", description: "源语种代号" }
      },
      required: ["text_content"]
    }, null, 2)
  }
];

export const initialHistoryChats: ChatSession[] = [
  {
    id: 'chat-1',
    title: '北京出差补贴与北京报销标准',
    model: 'DeepSeek-V3',
    associatedKBIds: ['kb-1'],
    updatedAt: '2026-06-11 11:02',
    messages: [
      {
        id: 'msg-1-1',
        role: 'user',
        content: '你好，我下周需要代表项目组去北京出差三天，期间跟客户有一顿招待餐定位。想确认一下北京的餐费补助和住宿标准上限，另外超过多少钱需要找业务VP审批？',
        timestamp: '11:01'
      },
      {
        id: 'msg-1-2',
        role: 'assistant',
        content: '',
        timestamp: '11:02',
        thoughtStep: {
          thought: '用户提问涉及北京出差补贴标准、住宿限额以及招待费审批层级。\n1. 需要查询已关联的知识库“企业财务与行政管理规范”中关于“北京”、“差旅住宿标准”、“差旅伙食补助”和“业务招待审批”的切片数据。\n2. 启动“企业财务及业务招待费报销管理规定(2026版).pdf”的知识检索。',
          action: 'RetrieveKnowledgeBase(kb_id="kb-1", query="北京 差旅 补贴 住宿 招待费 审批")',
          observation: '成功检索到2个匹配文档切片：\n- [chunk-1-1-1] 提到北京为一类城市，住宿上限为 550 元/间/夜；\n- [chunk-1-1-2] 提到一类城市餐补 120 元/天，但北京和上海特别执行 150 元/天；市内交通定额 80 元/天。\n- [chunk-1-1-3] 提到业务招待费小于 2000 元部门总监审批，2000-10000 元分管 VP 审批，超过 10000 元 CEO 审批。',
          state: 'success'
        },
        citations: [
          {
            id: 'cit-1',
            sourceDocName: '员工差旅及业务招待费报销管理规定(2026版).pdf',
            chunkText: '一类城市（北京、上海、广州等）国内住宿标准上限为 550 元/间/夜。',
            index: 1
          },
          {
            id: 'cit-2',
            sourceDocName: '员工差旅及业务招待费报销管理规定(2026版).pdf',
            chunkText: '一类城市每人每天伙食限额补贴标准为 120 元（北京、上海特别执行 150 元/天标准）；市内交通定额 80 元。',
            index: 2
          },
          {
            id: 'cit-3',
            sourceDocName: '员工差旅及业务招待费报销管理规定(2026版).pdf',
            chunkText: '单次招待费用在 2000 元以下由部门总监审批；2000元至 10000 元的需分管 VP 审批；超过 10000 元由 CEO 审批。',
            index: 3
          }
        ]
      }
    ]
  },
  {
    id: 'chat-2',
    title: '商品售后寄送及鉴定流转说明',
    model: 'GPT-4o',
    associatedKBIds: ['kb-2'],
    updatedAt: '2026-06-10 15:40',
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        content: '用户退回一款手机主板被烧了，主张是以旧换新，但怀疑是他们自己超载超频烧毁的，我们该怎么处理？',
        timestamp: '15:39'
      },
      {
        id: 'msg-2-2',
        role: 'assistant',
        content: '',
        timestamp: '15:40',
        thoughtStep: {
          thought: '用户反馈商品涉嫌人为损坏主张退换，需检索售后服务规范中关于人为损坏与检测标准的界定条件。',
          action: 'RetrieveKnowledgeBase(kb_id="kb-2", query="售后 质量问题 手机主板 检测 鉴定")',
          observation: '匹配到售后细则切片：\n- [chunk-2-1-2] 质量问题退换：15日内拍照上传，需售后工程师远程核定或返厂检测确属主板组件、内部元器件非人为缺陷损坏，才可换新。如果查实为人为操作、超频引起，则不适用全额报销报损。',
          state: 'success'
        },
        citations: [
          {
            id: 'cit-10',
            sourceDocName: '售后退换货服务细则说明书.pdf',
            chunkText: '经售后工程师远程核定或返厂检测确属主板组件、元器件非人为缺陷损坏方可申请换新。',
            index: 1
          }
        ]
      }
    ]
  }
];

// Fill pre-calculated response text strictly tracking mock standard details
initialHistoryChats[0].messages[1].content = `您好！根据您关联的知识库 **《员工差旅及业务招待费报销管理规定(2026版).pdf》**，针对您去北京出差3天的标准以及业务招待审批的疑问，详细规定如下：

### 1. 差旅补贴与住宿标准 (一类城市：北京)
*   **住宿费限额：** 北京属于本规范界定的一类城市，员工差旅住宿补贴上限为 **550 元 / 间 / 夜** [1]。
*   **伙食补助：** 一类城市标准每天 120 元，但**北京和上海作为特区，特别执行 150 元 / 天** 的伙食补贴标准 [2]。
*   **市内交通费：** 每天自付定额补贴为 **80 元 / 天**（包车或搭乘招待车天数需扣除）[2]。

### 2. 业务招待审批规定
如果您此行有客户招待餐饮，在发起报销前，需要关注以下审批门槛限制 [3]：
*   **单次 2000 元以下：** 部门总监（Director）审核即可；
*   **单次 2000元 至 10000元：** 需将报销单通过OA流转至**分管业务 VP 进行审批** [3]；
*   **单次 10000 元以上：** 必须由公司 **CEO** 亲自联合加签审批。

*划重点：发生招待费之前需提早在OA系统内申报接待申请单，报销时应同时提供OA批准凭证和餐饮清单税票。祝您出行顺利！*`;

initialHistoryChats[1].messages[1].content = `根据关联的售后服务规范 **《售后退换货服务细则说明书.pdf》**，关于客户主板烧毁并要求“以旧换新”的争议，处理规程建议如下：

1.  **先行鉴定，并非直接退换：** 依据售后条款，由质量缺陷引发的“以旧换新”申请，必须经过**“工程师远程核定或返厂检测”** [1]。主板是否确属“非人为缺陷损坏”（如自发虚焊、电容击穿等）是判断的前提。
2.  **人为超频/超载责任归属：** 如果检测确属人为过压超载、改装超频或液体泼溅所致的物理烧毁，不属于公司保修和以旧换新范畴，应当拒绝全额免费换新。可转为“自费有偿主板阶梯置换”。
3.  **物流及检测费分摊：** 若确查为非人为质量问题，来回运费方可由公司财务代缴或报销 [1]；若为用户自身不当操作责任，检测费用和来回退返运费均需由消费者自行承担。

您应当先引导客户在线提供高清图，并在后台发起“返厂主板物理成分金相检测”审批，寄回后交硬件部门出具检测报告，以此来规范客诉定级。`;
