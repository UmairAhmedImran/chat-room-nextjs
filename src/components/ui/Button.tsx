import { cva } from 'class-variance-authority'
import { FC } from 'react'

interface ButtonProps {}

const buttonVariants = cva(
    'active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-color focus:outline-none focus:ring-2 foucus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    ,{
        variants: {
            variant:{
                default: 'bg-slate-900 text-white hover:bg-slate-800',
                ghost: 'bg-transparent hover:text-slate-900 bg-slate-200'
            },
            size: {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-2',
                large: 'h-11 px-8',
            },    
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        },

    }
)

const Button: FC<ButtonProps> = ({}) => {
  return <div>Button</div>
}

export default Button