import * as React from "react"
import { TrendingUp, Headset, BellRing, RefreshCcwDot, Clipboard, FileText, FileInput, EllipsisVertical, Clock8, CirclePlay, ArrowDownUp, CircleCheck, MessageSquareText, Mail, MessageSquare, Calendar, Target, FileSpreadsheet, Workflow, Send, Loader2, AlertCircle, History, PencilLine } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

const ANIMATION_STYLES = `
  @keyframes tab-progress-15s { from { width: 0 } to { width: 100% } }
  @keyframes fadeUpIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
`