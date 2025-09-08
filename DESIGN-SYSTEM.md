# **Weight Tracker - Design System & Style Guide**

## **1. Overview**

**Design System Version:** 2.0  
**Last Updated:** 2025-09-08  
**Framework:** Tailwind CSS with shadcn/ui components  
**Color Space:** OKLCH for enhanced color accuracy  
**Token Standard:** W3C Design Tokens Level 1

### **1.1 Design Philosophy**
- **Clarity:** Clean, uncluttered interface focusing on data visibility
- **Consistency:** Token-driven design system ensuring cohesive visual language
- **Accessibility:** WCAG 2.1 Level AA compliance throughout
- **Responsiveness:** Mobile-first approach with fluid layouts
- **Performance:** Optimized tokens and components for fast loading
- **Scientific:** OKLCH color space for perceptually uniform color transitions

### **1.2 Target Devices**
- **Mobile:** 320px - 767px (primary focus)
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px and above

## **2. Design Tokens**

### **2.1 Token Architecture**

Our design system follows the W3C Design Tokens Level 1 specification with OKLCH color space for superior color accuracy and consistency across displays.

```json
{
  "$schema": "https://design-tokens.org/schema.json",
  "metadata": {
    "name": "Weight Tracker Design Tokens",
    "version": "2.0.0",
    "colorSpace": "oklch"
  }
}
```

### **2.2 Color System**

#### **Base Color Palette (OKLCH)**

**Neutral Palette:**
```json
"neutral": {
  "50": {"value": "oklch(98.5% 0 0)"},
  "100": {"value": "oklch(97% 0 0)"},
  "200": {"value": "oklch(92.2% 0 0)"},
  "300": {"value": "oklch(87% 0 0)"},
  "400": {"value": "oklch(70.8% 0 0)"},
  "500": {"value": "oklch(55.6% 0 0)"},
  "600": {"value": "oklch(43.9% 0 0)"},
  "700": {"value": "oklch(37.1% 0 0)"},
  "800": {"value": "oklch(26.9% 0 0)"},
  "900": {"value": "oklch(20.5% 0 0)"},
  "950": {"value": "oklch(14.5% 0 0)"}
}
```

**Success (Weight Loss):**
```json
"green": {
  "50": {"value": "oklch(98.2% .018 155.826)"},
  "100": {"value": "oklch(96.2% .044 156.743)"},
  "200": {"value": "oklch(92.5% .084 155.995)"},
  "300": {"value": "oklch(87.1% .15 154.449)"},
  "400": {"value": "oklch(79.2% .209 151.711)"},
  "500": {"value": "oklch(72.3% .219 149.579)"},
  "600": {"value": "oklch(62.7% .194 149.214)"},
  "700": {"value": "oklch(52.7% .154 150.069)"},
  "800": {"value": "oklch(44.8% .119 151.328)"},
  "900": {"value": "oklch(39.3% .095 152.535)"},
  "950": {"value": "oklch(26.6% .065 152.934)"}
}
```

**Destructive (Weight Gain):**
```json
"red": {
  "50": {"value": "oklch(97.1% .013 17.38)"},
  "100": {"value": "oklch(93.6% .032 17.717)"},
  "200": {"value": "oklch(88.5% .062 18.334)"},
  "300": {"value": "oklch(80.8% .114 19.571)"},
  "400": {"value": "oklch(70.4% .191 22.216)"},
  "500": {"value": "oklch(63.7% .237 25.331)"},
  "600": {"value": "oklch(57.7% .245 27.325)"},
  "700": {"value": "oklch(51.4% .222 16.935)"},
  "800": {"value": "oklch(44.4% .177 26.899)"},
  "900": {"value": "oklch(39.6% .141 25.723)"}
}
```

**Primary (UI Elements):**
```json
"blue": {
  "50": {"value": "oklch(97% .014 254.604)"},
  "100": {"value": "oklch(93.2% .032 255.585)"},
  "200": {"value": "oklch(88.2% .059 254.128)"},
  "400": {"value": "oklch(70.7% .165 254.624)"},
  "500": {"value": "oklch(62.3% .214 259.815)"},
  "600": {"value": "oklch(54.6% .245 262.881)"},
  "700": {"value": "oklch(48.8% .243 264.376)"},
  "800": {"value": "oklch(42.4% .199 265.638)"},
  "900": {"value": "oklch(37.9% .146 265.522)"},
  "950": {"value": "oklch(28.2% .091 267.935)"}
}
```

**Warning (On Track):**
```json
"amber": {
  "50": {"value": "oklch(98.7% .022 95.277)"},
  "100": {"value": "oklch(96.2% .059 95.617)"},
  "200": {"value": "oklch(92.4% .12 95.746)"},
  "300": {"value": "oklch(87.9% .169 91.605)"},
  "400": {"value": "oklch(82.8% .189 84.429)"},
  "500": {"value": "oklch(76.9% .188 70.08)"},
  "600": {"value": "oklch(68.1% .162 75.834)"},
  "700": {"value": "oklch(55.4% .135 66.442)"},
  "800": {"value": "oklch(47.6% .114 61.907)"},
  "900": {"value": "oklch(41.4% .112 45.904)"},
  "950": {"value": "oklch(27.9% .077 45.635)"}
}
```

#### **Semantic Color Tokens**

```json
"semantic": {
  "feedback": {
    "info": {"value": "{color.blue.500}"},
    "warning": {"value": "{color.amber.500}"},
    "error": {"value": "{color.red.500}"},
    "success": {"value": "{color.green.500}"}
  },
  "ui": {
    "background": {"value": "oklch(1.00 0 0)"},
    "foreground": {"value": "oklch(0.14 0.00 285.86)"},
    "card": {"value": "oklch(1.00 0 0)"},
    "cardForeground": {"value": "oklch(0.14 0.00 285.86)"},
    "popover": {"value": "oklch(1.00 0 0)"},
    "popoverForeground": {"value": "oklch(0.14 0.00 285.86)"},
    "primary": {"value": "oklch(0.21 0.01 285.93)"},
    "primaryForeground": {"value": "oklch(0.99 0 0)"},
    "secondary": {"value": "oklch(0.97 0 0)"},
    "secondaryForeground": {"value": "oklch(0.21 0.01 285.93)"},
    "muted": {"value": "oklch(0.97 0 0)"},
    "mutedForeground": {"value": "oklch(0.55 0.02 285.93)"},
    "accent": {"value": "oklch(0.97 0 0)"},
    "accentForeground": {"value": "oklch(0.21 0.01 285.93)"},
    "destructive": {"value": "oklch(0.58 0.24 28.48)"},
    "border": {"value": "oklch(0.92 0.00 286.61)"},
    "input": {"value": "oklch(0.92 0.00 286.61)"},
    "ring": {"value": "oklch(0.71 0.01 286.09)"}
  }
}
```

#### **Graph-Specific Tokens**

```json
"graph": {
  "weight": {
    "line": {"value": "{color.blue.500}"},
    "gradient": {"value": "oklch(62.3% .214 259.815 / 0.1)"},
    "point": {"value": "{color.blue.600}"}
  },
  "movingAverage": {
    "line": {"value": "{color.green.500}"},
    "point": {"value": "{color.green.600}"}
  },
  "goal": {
    "above": {"value": "{color.red.500}"},
    "below": {"value": "{color.green.500}"},
    "neutral": {"value": "{color.amber.500}"}
  },
  "milestone": {
    "marker": {"value": "{color.amber.400}"},
    "celebration": {"value": "{color.green.400}"}
  }
}
```

### **2.3 Typography Tokens**

#### **Font Families**
```json
"typography": {
  "family": {
    "sans": {"value": "'Geist', 'Geist Fallback', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"},
    "mono": {"value": "'Geist Mono', 'Geist Mono Fallback', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"}
  }
}
```

#### **Typography Scale**
```json
"typography": {
  "scale": {
    "xs": {
      "fontSize": {"value": ".75rem"},
      "lineHeight": {"value": "calc(1/.75)"}
    },
    "sm": {
      "fontSize": {"value": ".875rem"},
      "lineHeight": {"value": "calc(1.25/.875)"}
    },
    "base": {
      "fontSize": {"value": "1rem"},
      "lineHeight": {"value": "calc(1.5/1)"}
    },
    "lg": {
      "fontSize": {"value": "1.125rem"},
      "lineHeight": {"value": "calc(1.75/1.125)"}
    },
    "xl": {
      "fontSize": {"value": "1.25rem"},
      "lineHeight": {"value": "calc(1.75/1.25)"}
    },
    "2xl": {
      "fontSize": {"value": "1.5rem"},
      "lineHeight": {"value": "calc(2/1.5)"}
    },
    "3xl": {
      "fontSize": {"value": "1.875rem"},
      "lineHeight": {"value": "calc(2.25/1.875)"}
    },
    "4xl": {
      "fontSize": {"value": "2.25rem"},
      "lineHeight": {"value": "calc(2.5/2.25)"}
    }
  }
}
```

#### **Font Weights**
```json
"typography": {
  "weight": {
    "light": {"value": 300},
    "normal": {"value": 400},
    "medium": {"value": 500},
    "semibold": {"value": 600},
    "bold": {"value": 700},
    "black": {"value": 900}
  }
}
```

### **2.4 Spacing & Layout Tokens**

#### **Spacing Scale**
```json
"size": {
  "spacing": {
    "0": {"value": "0px"},
    "1": {"value": "0.25rem"},
    "2": {"value": "0.5rem"},
    "3": {"value": "0.75rem"},
    "4": {"value": "1rem"},
    "5": {"value": "1.25rem"},
    "6": {"value": "1.5rem"},
    "8": {"value": "2rem"},
    "10": {"value": "2.5rem"},
    "12": {"value": "3rem"},
    "16": {"value": "4rem"},
    "20": {"value": "5rem"},
    "24": {"value": "6rem"}
  }
}
```

#### **Border Radius**
```json
"size": {
  "radius": {
    "xs": {"value": ".125rem"},
    "sm": {"value": "calc({size.radius.lg.value} - 4px)"},
    "md": {"value": "calc({size.radius.lg.value} - 2px)"},
    "lg": {"value": "0.625rem"},
    "xl": {"value": "calc({size.radius.lg.value} + 4px)"},
    "2xl": {"value": "1rem"},
    "3xl": {"value": "1.5rem"}
  }
}
```

#### **Breakpoints**
```json
"size": {
  "breakpoint": {
    "sm": {"value": "40rem"},
    "md": {"value": "48rem"},
    "lg": {"value": "64rem"},
    "xl": {"value": "80rem"},
    "2xl": {"value": "96rem"}
  }
}
```

### **2.5 Motion & Animation Tokens**

#### **Easing Functions**
```json
"motion": {
  "easing": {
    "in": {"value": "cubic-bezier(.4,0,1,1)"},
    "out": {"value": "cubic-bezier(0,0,.2,1)"},
    "inOut": {"value": "cubic-bezier(.4,0,.2,1)"}
  },
  "duration": {
    "fast": {"value": ".15s"},
    "default": {"value": ".2s"},
    "slow": {"value": ".3s"},
    "theme": {"value": ".3s"}
  }
}
```

#### **Animation Keyframes**
```json
"motion": {
  "keyframes": {
    "fadeIn": {"value": "fd-fade-in .3s ease"},
    "fadeOut": {"value": "fd-fade-out .3s ease"},
    "slideIn": {"value": "fd-slide-in .25s ease"},
    "slideOut": {"value": "fd-slide-out .25s ease"},
    "graphDraw": {"value": "graph-draw 1.5s ease-in-out"},
    "confetti": {"value": "confetti-fall 3s linear infinite"},
    "pulse": {"value": "pulse 2s cubic-bezier(.4,0,.6,1) infinite"}
  }
}
```

### **2.6 Shadow Tokens**

```json
"shadow": {
  "presets": {
    "xs": {"value": "0 1px 3px 0px oklch(0.00 0 0 / 0.05)"},
    "sm": {"value": "0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 1px 2px -1px oklch(0.00 0 0 / 0.10)"},
    "md": {"value": "0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 2px 4px -1px oklch(0.00 0 0 / 0.10)"},
    "lg": {"value": "0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 4px 6px -1px oklch(0.00 0 0 / 0.10)"},
    "xl": {"value": "0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 8px 10px -1px oklch(0.00 0 0 / 0.10)"}
  }
}
```

## **3. Component System (shadcn/ui Integration)**

### **3.1 Button Components**

#### **Primary Button**
```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PrimaryButton = ({ children, className, ...props }) => (
  <Button 
    className={cn(
      "bg-primary text-primary-foreground hover:bg-primary/90",
      "h-10 px-4 py-2 rounded-md font-medium",
      "transition-colors duration-150 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    {children}
  </Button>
)
```

#### **Success Button (Weight Loss)**
```tsx
const SuccessButton = ({ children, className, ...props }) => (
  <Button 
    className={cn(
      "bg-green-500 text-white hover:bg-green-600",
      "shadow-sm hover:shadow-md transition-all duration-150",
      className
    )}
    {...props}
  >
    {children}
  </Button>
)
```

#### **Destructive Button (Delete)**
```tsx
const DestructiveButton = ({ children, className, ...props }) => (
  <Button 
    variant="destructive"
    className={cn(
      "bg-red-500 text-white hover:bg-red-600",
      "shadow-sm hover:shadow-md transition-all duration-150",
      className
    )}
    {...props}
  >
    {children}
  </Button>
)
```

### **3.2 Input Components**

#### **Weight Input (Monospace)**
```tsx
import { Input } from "@/components/ui/input"

const WeightInput = ({ value, onChange, className, ...props }) => (
  <Input
    type="number"
    step="0.01"
    min="30"
    max="300"
    value={value}
    onChange={onChange}
    className={cn(
      "font-mono text-right tabular-nums",
      "h-10 w-full rounded-md border border-input bg-background",
      "px-3 py-2 text-sm ring-offset-background",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    placeholder="75.50"
    {...props}
  />
)
```

#### **Date Input**
```tsx
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

const DateInput = ({ date, onDateSelect, className }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateSelect}
        disabled={(date) => date > new Date()}
        initialFocus
      />
    </PopoverContent>
  </Popover>
)
```

### **3.3 Card Components**

#### **Stats Card**
```tsx
import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"

const StatsCard = ({ 
  title, 
  value, 
  unit = "kg", 
  change, 
  trend,
  className 
}) => (
  <Card className={cn("relative overflow-hidden", className)}>
    <CardContent className="p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums">
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-xs",
            trend === "down" ? "text-green-600" : "text-red-600"
          )}>
            {trend === "down" ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            <span>{Math.abs(change)}% from yesterday</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)
```

#### **Goal Progress Card**
```tsx
import { Progress } from "@/components/ui/progress"
import { Target, Calendar, TrendingDown } from "lucide-react"

const GoalProgressCard = ({ 
  targetWeight, 
  currentWeight, 
  deadline, 
  daysRemaining,
  progressPercentage,
  status // "ahead" | "on-track" | "behind"
}) => (
  <Card className="relative">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-semibold">Weight Goal</span>
          </div>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            status === "ahead" && "bg-green-100 text-green-700",
            status === "on-track" && "bg-amber-100 text-amber-700", 
            status === "behind" && "bg-red-100 text-red-700"
          )}>
            {status.replace("-", " ").toUpperCase()}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="font-bold font-mono text-lg">{targetWeight} kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="font-bold font-mono text-lg">{currentWeight} kg</p>
          </div>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{daysRemaining} days left</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingDown className="h-4 w-4" />
            <span>{(currentWeight - targetWeight).toFixed(1)} kg to go</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)
```

### **3.4 Table Components**

#### **Responsive Weight Table**
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const WeightTable = ({ entries, onRowClick }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead className="text-right">Weight</TableHead>
        <TableHead className="text-right hidden md:table-cell">Daily Change</TableHead>
        <TableHead className="text-right">Avg Change</TableHead>
        <TableHead className="hidden md:table-cell">Remaining</TableHead>
        <TableHead className="hidden md:table-cell">Memo</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {entries.map((entry) => (
        <TableRow 
          key={entry.id} 
          className="hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onRowClick(entry)}
        >
          <TableCell className="font-medium">
            {format(new Date(entry.date), "MMM dd")}
          </TableCell>
          <TableCell className="text-right font-mono tabular-nums">
            {entry.weight.toFixed(2)}
          </TableCell>
          <TableCell className="text-right hidden md:table-cell">
            <Badge variant={entry.dailyChange >= 0 ? "destructive" : "success"}>
              {entry.dailyChange >= 0 ? "+" : ""}{entry.dailyChange.toFixed(1)}%
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <Badge variant={entry.avgChange >= 0 ? "destructive" : "success"}>
              {entry.avgChange >= 0 ? "+" : ""}{entry.avgChange.toFixed(1)}%
            </Badge>
          </TableCell>
          <TableCell className="hidden md:table-cell font-mono">
            {entry.remaining > 0 ? `${entry.remaining.toFixed(1)} kg` : "🎉 Goal met!"}
          </TableCell>
          <TableCell className="hidden md:table-cell truncate max-w-[200px]">
            {entry.memo}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)
```

### **3.5 Modal Components**

#### **Weight Entry Modal**
```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const WeightEntryModal = ({ 
  open, 
  onOpenChange, 
  entry, 
  onSave, 
  onDelete 
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle>
          {entry?.id ? 'Edit Weight Entry' : 'Add Weight Entry'}
        </SheetTitle>
        <SheetDescription>
          Record your weight and add any notes about your progress.
        </SheetDescription>
      </SheetHeader>
      
      <div className="grid gap-6 py-6">
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <DateInput 
            id="date"
            date={entry?.date}
            onDateSelect={(date) => handleFieldChange('date', date)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <WeightInput
            id="weight"
            value={entry?.weight || ''}
            onChange={(e) => handleFieldChange('weight', e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="memo">Memo (optional)</Label>
          <Textarea
            id="memo"
            placeholder="How are you feeling today? Any notes..."
            value={entry?.memo || ''}
            onChange={(e) => handleFieldChange('memo', e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>
      </div>
      
      <SheetFooter className="flex gap-2">
        {entry?.id && (
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="mr-auto"
          >
            Delete
          </Button>
        )}
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          {entry?.id ? 'Update' : 'Save'} Entry
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)
```

### **3.6 Toast Components**

#### **Success Toast**
```tsx
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, Undo } from "lucide-react"

const useSuccessToast = () => {
  const { toast } = useToast()
  
  return (message, action) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Success!</span>
        </div>
      ),
      description: message,
      action: action && (
        <ToastAction altText="Undo" onClick={action}>
          <Undo className="h-4 w-4 mr-1" />
          Undo
        </ToastAction>
      ),
      className: "border-green-200 bg-green-50",
    })
  }
}
```

#### **Error Toast**
```tsx
import { XCircle, RefreshCw } from "lucide-react"

const useErrorToast = () => {
  const { toast } = useToast()
  
  return (message, retryAction) => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          <span>Error</span>
        </div>
      ),
      description: message,
      action: retryAction && (
        <ToastAction altText="Retry" onClick={retryAction}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </ToastAction>
      ),
    })
  }
}
```

## **4. Loading States & Skeletons**

### **4.1 Skeleton Components**

#### **Card Skeleton**
```tsx
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

const CardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </CardContent>
  </Card>
)
```

#### **Table Skeleton**
```tsx
const TableSkeleton = ({ rows = 5 }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead><Skeleton className="h-4 w-16" /></TableHead>
        <TableHead className="text-right"><Skeleton className="h-4 w-12" /></TableHead>
        <TableHead className="text-right hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableHead>
        <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead>
        <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
        <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)
```

#### **Graph Skeleton**
```tsx
const GraphSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="h-[300px] md:h-[400px] w-full rounded-md bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="flex items-end justify-between h-full p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton 
              key={i}
              className="rounded-t-sm bg-muted" 
              style={{ 
                height: `${Math.random() * 60 + 20}%`, 
                width: '12%' 
              }} 
            />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)
```

## **5. Animation System**

### **5.1 CSS Keyframes**

```css
@keyframes graph-draw {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
  }
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotateZ(720deg);
    opacity: 0;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### **5.2 Animation Classes**

```css
.animate-graph-draw {
  animation: graph-draw 1.5s ease-in-out;
}

.animate-confetti {
  animation: confetti-fall 3s linear infinite;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

/* Transition utilities */
.transition-theme {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

## **6. Responsive Design**

### **6.1 Breakpoint Strategy**

```tsx
const breakpoints = {
  sm: '640px',  // Mobile landscape, small tablets
  md: '768px',  // Tablets
  lg: '1024px', // Laptops
  xl: '1280px', // Desktops
  '2xl': '1536px' // Large desktops
}

// Usage in components
const ResponsiveComponent = () => (
  <div className="
    grid grid-cols-1 gap-4
    md:grid-cols-2 md:gap-6
    lg:grid-cols-3 lg:gap-8
  ">
    {/* Content */}
  </div>
)
```

### **6.2 Container Queries (Future)**

```tsx
// Using CSS container queries for component-level responsiveness
const AdaptiveCard = () => (
  <Card className="@container">
    <CardContent className="
      p-4
      @md:p-6
      @lg:p-8
    ">
      <div className="
        flex flex-col gap-2
        @md:flex-row @md:gap-4
        @lg:gap-6
      ">
        {/* Content adapts to container size */}
      </div>
    </CardContent>
  </Card>
)
```

## **7. Accessibility Guidelines**

### **7.1 Focus Management**

```css
/* Custom focus styles */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}

/* Skip link */
.skip-link {
  @apply absolute -top-10 left-4 z-50 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-md transition-all;
  @apply focus:top-4;
}
```

### **7.2 Screen Reader Support**

```tsx
// Screen reader only content
const ScreenReaderOnly = ({ children }) => (
  <span className="sr-only">{children}</span>
)

// Accessible button with screen reader text
const IconButton = ({ icon: Icon, label, ...props }) => (
  <Button variant="ghost" size="icon" {...props}>
    <Icon className="h-4 w-4" />
    <ScreenReaderOnly>{label}</ScreenReaderOnly>
  </Button>
)

// Live region for dynamic updates
const LiveRegion = ({ children, level = "polite" }) => (
  <div 
    aria-live={level} 
    aria-atomic="true" 
    className="sr-only"
  >
    {children}
  </div>
)
```

### **7.3 Color Contrast & High Contrast Mode**

```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --border: oklch(0% 0 0);
    --ring: oklch(0% 0 0);
  }
  
  [data-theme="dark"] {
    --border: oklch(100% 0 0);
    --ring: oklch(100% 0 0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-graph-draw,
  .animate-confetti,
  .animate-shimmer,
  .animate-fade-in,
  .animate-slide-in-right {
    animation: none;
  }
  
  .transition-theme,
  .transition-colors {
    transition: none;
  }
}
```

## **8. Dark Mode Implementation**

### **8.1 Theme Toggle**

```tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 transition-colors"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <ScreenReaderOnly>Toggle theme</ScreenReaderOnly>
    </Button>
  )
}
```

### **8.2 Dark Mode Variables**

```css
:root {
  /* Light theme tokens */
  --background: oklch(100% 0 0);
  --foreground: oklch(14.5% 0 0);
  --card: oklch(100% 0 0);
  --card-foreground: oklch(14.5% 0 0);
  --popover: oklch(100% 0 0);
  --popover-foreground: oklch(14.5% 0 0);
  --primary: oklch(14.5% 0 0);
  --primary-foreground: oklch(98.5% 0 0);
  --secondary: oklch(97% 0 0);
  --secondary-foreground: oklch(14.5% 0 0);
  --muted: oklch(97% 0 0);
  --muted-foreground: oklch(55.6% 0 0);
  --accent: oklch(97% 0 0);
  --accent-foreground: oklch(14.5% 0 0);
  --destructive: oklch(63.7% 0.237 25.331);
  --destructive-foreground: oklch(98.5% 0 0);
  --success: oklch(72.3% 0.219 149.579);
  --success-foreground: oklch(98.5% 0 0);
  --warning: oklch(76.9% 0.188 70.08);
  --warning-foreground: oklch(14.5% 0 0);
  --border: oklch(92.2% 0 0);
  --input: oklch(92.2% 0 0);
  --ring: oklch(14.5% 0 0);
}

[data-theme="dark"] {
  /* Dark theme tokens */
  --background: oklch(14.5% 0 0);
  --foreground: oklch(98.5% 0 0);
  --card: oklch(14.5% 0 0);
  --card-foreground: oklch(98.5% 0 0);
  --popover: oklch(14.5% 0 0);
  --popover-foreground: oklch(98.5% 0 0);
  --primary: oklch(98.5% 0 0);
  --primary-foreground: oklch(14.5% 0 0);
  --secondary: oklch(20.5% 0 0);
  --secondary-foreground: oklch(98.5% 0 0);
  --muted: oklch(20.5% 0 0);
  --muted-foreground: oklch(70.8% 0 0);
  --accent: oklch(20.5% 0 0);
  --accent-foreground: oklch(98.5% 0 0);
  --destructive: oklch(63.7% 0.237 25.331);
  --destructive-foreground: oklch(98.5% 0 0);
  --success: oklch(72.3% 0.219 149.579);
  --success-foreground: oklch(14.5% 0 0);
  --warning: oklch(76.9% 0.188 70.08);
  --warning-foreground: oklch(14.5% 0 0);
  --border: oklch(26.9% 0 0);
  --input: oklch(26.9% 0 0);
  --ring: oklch(70.8% 0 0);
}
```

## **9. Implementation Guidelines**

### **9.1 Token Usage**

```tsx
// ✅ Good: Use semantic tokens
const StatusBadge = ({ status }) => (
  <Badge className={cn(
    status === "success" && "bg-success text-success-foreground",
    status === "error" && "bg-destructive text-destructive-foreground",
    status === "warning" && "bg-warning text-warning-foreground"
  )}>
    {status}
  </Badge>
)

// ❌ Bad: Use raw color values
const StatusBadge = ({ status }) => (
  <Badge className={cn(
    status === "success" && "bg-green-500 text-white",
    status === "error" && "bg-red-500 text-white"
  )}>
    {status}
  </Badge>
)
```

### **9.2 Component Composition**

```tsx
// Create compound components using shadcn/ui primitives
const WeightGoalCard = {
  Root: ({ children, className }) => (
    <Card className={cn("relative", className)}>
      {children}
    </Card>
  ),
  Header: ({ title, status, className }) => (
    <CardHeader className={cn("flex flex-row items-center justify-between", className)}>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        {title}
      </CardTitle>
      <Badge variant={status}>{status}</Badge>
    </CardHeader>
  ),
  Content: ({ children, className }) => (
    <CardContent className={cn("space-y-4", className)}>
      {children}
    </CardContent>
  ),
  Progress: ({ value, className }) => (
    <Progress value={value} className={cn("h-2", className)} />
  )
}

// Usage
const ExampleGoal = () => (
  <WeightGoalCard.Root>
    <WeightGoalCard.Header title="Weight Goal" status="on-track" />
    <WeightGoalCard.Content>
      <WeightGoalCard.Progress value={65} />
    </WeightGoalCard.Content>
  </WeightGoalCard.Root>
)
```

### **9.3 Performance Optimizations**

```tsx
// Lazy load animations
const ConfettiEffect = lazy(() => import('./ConfettiEffect'))

// Optimize heavy components
const MemoizedGraph = memo(WeightGraph, (prevProps, nextProps) => {
  return (
    prevProps.data.length === nextProps.data.length &&
    prevProps.timeRange === nextProps.timeRange
  )
})

// Use React.startTransition for non-urgent updates
const updateTheme = (newTheme) => {
  startTransition(() => {
    setTheme(newTheme)
  })
}
```

This comprehensive design system provides a solid foundation for building the Weight Tracker application with consistency, accessibility, and maintainability at its core.