import type { Operation } from '../core/types'
import { base64Decode } from './encoding/base64'

/**
 * Central operation registry.
 * Adding a new operation: (1) write its file, (2) import + register here, (3) add a test.
 * The recipe engine and UI never need to change for a new op.
 */
const allOperations: Operation[] = [base64Decode]

export const operationsMap: Map<string, Operation> = new Map(
  allOperations.map((op) => [op.id, op]),
)

export function getOperation(id: string): Operation | undefined {
  return operationsMap.get(id)
}

export function getAllOperations(): Operation[] {
  return [...allOperations]
}

export function getOperationsByCategory(
  category: Operation['category'],
): Operation[] {
  return allOperations.filter((op) => op.category === category)
}
