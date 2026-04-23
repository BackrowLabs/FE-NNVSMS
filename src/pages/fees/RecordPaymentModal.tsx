import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { feeApi } from '../../api/feeApi'
import type { StudentFee } from '../../types/fee'

interface Props {
  studentFee: StudentFee
  onClose: () => void
  onSuccess: () => void
}

type FormValues = { amount: number; paymentDate: string; notes: string }

export default function RecordPaymentModal({ studentFee, onClose, onSuccess }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      amount: studentFee.balance,
      paymentDate: new Date().toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FormValues) => feeApi.recordPayment({
      studentFeeId: studentFee.id,
      amount: Number(data.amount),
      paymentDate: data.paymentDate,
      notes: data.notes || undefined,
    }),
    onSuccess,
  })

  const totalDue = studentFee.amountDue + studentFee.lateFee

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Student</span>
              <span className="font-medium">{studentFee.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fee Type</span>
              <span>{studentFee.feeType} — Installment #{studentFee.installmentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Due</span>
              <span>₹ {studentFee.amountDue.toLocaleString()}</span>
            </div>
            {studentFee.lateFee > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Late Fee</span>
                <span>₹ {studentFee.lateFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-gray-200 pt-1 mt-1">
              <span>Balance</span>
              <span>₹ {studentFee.balance.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Being Paid *</label>
              <input
                type="number"
                step="0.01"
                max={totalDue}
                {...register('amount', { required: true, min: 1, max: totalDue })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">Enter a valid amount (max ₹{totalDue})</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input
                type="date"
                {...register('paymentDate', { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <p className="text-xs text-gray-400">
              Payment will be submitted for admin approval before a receipt is generated.
            </p>

            {mutation.error && (
              <p className="text-red-500 text-sm">
                {(mutation.error as any)?.response?.data?.detail ?? 'Something went wrong'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={mutation.isPending}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {mutation.isPending ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
