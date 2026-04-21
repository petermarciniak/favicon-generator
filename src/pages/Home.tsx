import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Code2, Palette, Package } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Modal,
  Select,
} from '@/components/ui'
import { useToast } from '@/components/ui'

const demoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Please select a role'),
})

type DemoForm = z.infer<typeof demoSchema>

const features = [
  { icon: Zap, title: 'Vite + React', desc: 'Lightning-fast HMR and builds', badge: 'v5' },
  { icon: Code2, title: 'TypeScript', desc: 'Full type safety out of the box', badge: 'strict' },
  { icon: Palette, title: 'Tailwind CSS', desc: 'Dark mode + custom tokens', badge: 'v3' },
  { icon: Package, title: 'Batteries included', desc: 'Routing, state, forms, query', badge: 'ready' },
]

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DemoForm>({ resolver: zodResolver(demoSchema) })

  async function onSubmit(data: DemoForm) {
    await new Promise((r) => setTimeout(r, 800))
    toast(`Welcome, ${data.name}!`, 'success')
    reset()
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="text-center">
        <Badge variant="primary" className="mb-4">
          Prototype starter
        </Badge>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          From idea to prototype,{' '}
          <span className="text-primary-600">fast.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-slate-500 dark:text-slate-400">
          Everything you need to validate a web app idea — routing, state, forms, toasts, dark
          mode, and a clean component library.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => setModalOpen(true)}>Try the demo form</Button>
          <Button variant="outline" onClick={() => toast('Toasts work!', 'info')}>
            Test a toast
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc, badge }) => (
            <Card key={title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <Badge variant="default">{badge}</Badge>
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick reference */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Quick reference</CardTitle>
            <CardDescription>Key files to edit when building your idea</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                ['src/App.tsx', 'Add routes'],
                ['src/pages/', 'Create new pages'],
                ['src/components/ui/', 'Reusable UI primitives'],
                ['src/store/index.ts', 'Global Zustand state'],
                ['src/lib/api.ts', 'API client wrapper'],
                ['src/hooks/', 'Custom React hooks'],
                ['.env.example', 'Environment variables'],
                ['tailwind.config.js', 'Colors & tokens'],
              ].map(([file, desc]) => (
                <div key={file} className="flex items-start gap-2 rounded p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <code className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {file}
                  </code>
                  <span className="text-slate-500">{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-slate-400">Delete this page and start building your idea.</p>
          </CardFooter>
        </Card>
      </section>

      {/* Demo modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Demo form"
        description="React Hook Form + Zod validation"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Name" placeholder="Jane Smith" error={errors.name?.message} {...register('name')} />
          <Input
            label="Email"
            type="email"
            placeholder="jane@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            label="Role"
            placeholder="Select a role..."
            options={[
              { label: 'Developer', value: 'developer' },
              { label: 'Designer', value: 'designer' },
              { label: 'Product', value: 'product' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
