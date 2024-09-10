// @ts-nocheck


"use client"

import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ComboboxProps {
  options: string[]
  onSelect: (options: string[]) => void
  placeholder: string
  emptyMessage?: string
}

export function DataCombobox({
  options,
  onSelect,
  placeholder,
  emptyMessage = "No options found.",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([])

  const toggleOption = (option: string) => {
    const updatedSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option]

    setSelectedOptions(updatedSelectedOptions)
    onSelect(updatedSelectedOptions)
  }

  const toggleSelectAll = () => {
    const updatedSelectedOptions = selectedOptions.length === options.length ? [] : options
    setSelectedOptions(updatedSelectedOptions)
    onSelect(updatedSelectedOptions)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : placeholder}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={`${placeholder}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={toggleSelectAll} className="flex items-center cursor-pointer">
                Selectionner tout
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedOptions.length === options.length ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = selectedOptions.includes(option)
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => toggleOption(option)}
                      className={cn(
                        "flex items-center cursor-pointer",
                        isSelected && "bg-blue-100 text-neutral-900"
                      )}
                    >
                      {option}
                      <CheckIcon
                        className={cn("ml-auto h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                      />
                    </CommandItem>
                  )
                })
              ) : (
                <div>{emptyMessage}</div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
