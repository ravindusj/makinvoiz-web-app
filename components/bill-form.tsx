"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { loadUserSettings } from "@/lib/settings"
import { saveBill } from "@/lib/bills"
import { generateUniqueId } from "@/lib/id-utils"
import { useEffect, useState } from "react"

interface BillItem {
  id: number
  description: string
  quantity: number
  rate: number
  discount: number
  discountType: 'percentage' | 'amount'
}

interface BillData {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  clientName: string
  clientAddress: string
  billNumber: string
  billDate: string
  dueDate: string
  items: BillItem[]
  terms: string
  notes: string
  signature: string
  id?: string
}

interface BillFormProps {
  data: BillData
  onChange: (data: BillData) => void
}

export function BillForm({ data, onChange }: BillFormProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})

  // Format number with thousand separators and 2 decimal places
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const parseCurrency = (value: string) => {
    // Remove commas and convert to number
    const parsedValue = parseFloat(value.replace(/,/g, ''));
    return isNaN(parsedValue) ? 0 : parsedValue;
  }

  // Initialize with default settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      const defaultSettings = await loadUserSettings()
      if (
        data.companyName === "<your-company-name>" &&
        data.terms === "Payment due within 15 days. Service warranty applies for 30 days."
      ) {
        // Only update if using default values
        onChange({
          ...data,
          companyName: defaultSettings.companyName,
          companyAddress: defaultSettings.companyAddress,
          companyPhone: defaultSettings.companyPhone,
          companyEmail: defaultSettings.companyEmail,
          terms: defaultSettings.defaultTerms,
          notes: defaultSettings.defaultNotes,
        })
      }
    }

    loadSettings()
  }, [])

  const updateData = (updates: Partial<BillData>) => {
    onChange({ ...data, ...updates })
  }

  const addItem = () => {
    const newItem: BillItem = {
      id: generateUniqueId(),
      description: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 'percentage',
    }
    updateData({ items: [...data.items, newItem] })
  }

  const updateItem = (id: number, updates: Partial<BillItem>) => {
    console.log('Updating item:', id, updates);
    console.log('Current items:', data.items);
    const itemToUpdate = data.items.find(item => item.id === id);
    console.log('Item to update:', itemToUpdate);
    
    const updatedItems = data.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        console.log('Updated item:', updatedItem);
        return updatedItem;
      }
      return item;
    });
    
    console.log('Updated items:', updatedItems);
    updateData({ items: updatedItems });
  }

  const removeItem = (id: number) => {
    updateData({ items: data.items.filter((item) => item.id !== id) })
  }

  const handleSave = async () => {
    if (!data) return
    setIsSaving(true)
    try {
      const result = await saveBill(data)
      if (result.success && result.id) {
        toast({
          title: "Success",
          description: "Bill saved successfully",
        })
        window.location.href = `/bills/view/${result.id}`
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save bill",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bill",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 min-w-0 flex-1">Bill Details</h2>
        <Button 
          onClick={handleSave} 
          className="bg-orange-600 hover:bg-orange-700 flex-shrink-0 text-sm sm:text-base" 
          disabled={isSaving}
          size="sm"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              <span>Save</span>
            </>
          )}
        </Button>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="companyName" className="text-sm">Company Name</Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => updateData({ companyName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="companyPhone" className="text-sm">Phone</Label>
            <Input
              id="companyPhone"
              value={data.companyPhone}
              onChange={(e) => updateData({ companyPhone: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="companyAddress" className="text-sm">Address</Label>
            <Textarea
              id="companyAddress"
              value={data.companyAddress}
              onChange={(e) => updateData({ companyAddress: e.target.value })}
              rows={2}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="companyEmail" className="text-sm">Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={data.companyEmail}
              onChange={(e) => updateData({ companyEmail: e.target.value })}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="clientName" className="text-sm">Client Name</Label>
            <Input
              id="clientName"
              value={data.clientName}
              onChange={(e) => updateData({ clientName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="billNumber" className="text-sm">Bill Number</Label>
            <Input
              id="billNumber"
              value={data.billNumber}
              onChange={(e) => updateData({ billNumber: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="clientAddress" className="text-sm">Client Address</Label>
            <Textarea
              id="clientAddress"
              value={data.clientAddress}
              onChange={(e) => updateData({ clientAddress: e.target.value })}
              rows={2}
              className="mt-1"
            />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="billDate" className="text-sm">Bill Date</Label>
              <Input
                id="billDate"
                type="date"
                value={data.billDate}
                onChange={(e) => updateData({ billDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dueDate" className="text-sm">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={data.dueDate}
                onChange={(e) => updateData({ dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Items</CardTitle>
          <Button onClick={addItem} size="sm" variant="outline" className="w-full sm:w-auto text-xs md:text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {data.items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 lg:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                {/* Description - Full width on mobile */}
                <div className="lg:col-span-2">
                  <Label className="text-sm">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Service description"
                    className="mt-1"
                  />
                </div>
                
                {/* Mobile: 2x2 grid for quantity, rate, discount, remove button */}
                <div className="grid grid-cols-2 gap-3 lg:contents">
                  <div>
                    <Label className="text-sm">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity === 0 ? "" : item.quantity}
                      onBlur={(e) => {
                        const value = e.target.value === "" ? 1 : Math.max(1, parseInt(e.target.value));
                        updateItem(item.id, { quantity: value });
                      }}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          updateItem(item.id, { quantity: value });
                        }
                      }}
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Rate (Rs.)</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={editingValues[`rate-${item.id}`] !== undefined 
                        ? editingValues[`rate-${item.id}`] 
                        : (item.rate === 0 ? "" : formatCurrency(item.rate))
                      }
                      onFocus={() => {
                        // Store the formatted value when starting to edit
                        const key = `rate-${item.id}`;
                        if (editingValues[key] === undefined) {
                          setEditingValues(prev => ({
                            ...prev,
                            [key]: item.rate === 0 ? "" : formatCurrency(item.rate)
                          }));
                        }
                      }}
                      onBlur={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        const value = rawValue === "" ? 0 : Math.max(0, parseFloat(rawValue));
                        updateItem(item.id, { rate: value });
                        // Clear the editing state
                        setEditingValues(prev => {
                          const newState = { ...prev };
                          delete newState[`rate-${item.id}`];
                          return newState;
                        });
                      }}
                      onChange={(e) => {
                        // Remove commas for validation
                        const rawValue = e.target.value.replace(/,/g, '');
                        // Allow only numbers and decimal point
                        if (!/^[\d]*\.?\d*$/.test(rawValue) && rawValue !== "") return;
                        
                        // Format with commas while typing
                        const formattedValue = rawValue === "" ? "" : 
                          rawValue.includes('.') ? 
                            rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') :
                            rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        
                        // Update local editing state
                        setEditingValues(prev => ({
                          ...prev,
                          [`rate-${item.id}`]: formattedValue
                        }));
                      }}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Discount</Label>
                    <div className="flex gap-2 mt-1">
                      <Select
                        value={item.discountType || 'percentage'}
                        onValueChange={(value: 'percentage' | 'amount') => {
                          updateItem(item.id, { discountType: value, discount: 0 });
                        }}
                      >
                        <SelectTrigger className="w-16 sm:w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="amount">Rs.</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type={item.discountType === 'amount' ? "text" : "number"}
                        inputMode={item.discountType === 'amount' ? "numeric" : "numeric"}
                        value={item.discountType === 'amount' 
                          ? (editingValues[`discount-${item.id}`] !== undefined 
                              ? editingValues[`discount-${item.id}`] 
                              : (item.discount === 0 ? "" : formatCurrency(item.discount))
                            )
                          : (item.discount === 0 ? "" : item.discount)
                        }
                        onFocus={() => {
                          if (item.discountType === 'amount') {
                            const key = `discount-${item.id}`;
                            if (editingValues[key] === undefined) {
                              setEditingValues(prev => ({
                                ...prev,
                                [key]: item.discount === 0 ? "" : formatCurrency(item.discount)
                              }));
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/,/g, '');
                          const value = rawValue === "" ? 0 : parseFloat(rawValue);
                          const maxValue = item.discountType === 'percentage' ? 100 : Infinity;
                          const finalValue = Math.min(maxValue, Math.max(0, value));
                          updateItem(item.id, { discount: finalValue });
                          
                          // Clear the editing state for amount type
                          if (item.discountType === 'amount') {
                            setEditingValues(prev => {
                              const newState = { ...prev };
                              delete newState[`discount-${item.id}`];
                              return newState;
                            });
                          }
                        }}
                        onChange={(e) => {
                          if (item.discountType === 'amount') {
                            // Remove commas for validation
                            const rawValue = e.target.value.replace(/,/g, '');
                            // Allow only numbers and decimal point
                            if (!/^[\d]*\.?\d*$/.test(rawValue) && rawValue !== "") return;
                            
                            // Format with commas while typing
                            const formattedValue = rawValue === "" ? "" : 
                              rawValue.includes('.') ? 
                                rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') :
                                rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                            
                            // Update local editing state
                            setEditingValues(prev => ({
                              ...prev,
                              [`discount-${item.id}`]: formattedValue
                            }));
                          } else {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              updateItem(item.id, { discount: value });
                            }
                          }
                        }}
                        min="0"
                        max={item.discountType === 'percentage' ? "100" : undefined}
                        className="flex-1"
                        placeholder={item.discountType === 'percentage' ? "0" : "0.00"}
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 w-full lg:w-auto mt-1 lg:mt-0"
                    >
                      <Trash2 className="w-4 h-4 lg:mr-0" />
                      <span className="ml-2 lg:hidden">Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terms and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.terms}
              onChange={(e) => updateData({ terms: e.target.value })}
              rows={4}
              placeholder="Enter terms and conditions..."
              className="text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.notes}
              onChange={(e) => updateData({ notes: e.target.value })}
              rows={4}
              placeholder="Enter additional notes..."
              className="text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
