# BigInt utils

## Types

```ts
type BI = bigint
type BIish = BI | string | number
```

## Convert

### `toDecimals`

#### Signature
```ts
function toDecimals(amount: BIish, decimals: number): string {}
```

#### Description
Convert `BIish` to string by provided decimals

### `fromDecimals`

#### Signature
```ts
function fromDecimals(
  amount: string,
  decimals: number,
  options?: Partial<BIParseOption>,
): BI {}
```

#### Description
Convert string to `BIish` by provided decimals

Parse options
```ts
type BIParseOption = {
  isDecimalsCountOverflowPossible: boolean // throw error or ignore if string has more symbols than provided decimals
}
```
Default options
```ts
type BIParseOption = {
  isDecimalsCountOverflowPossible: true
}
```

### `fromBIish`

#### Signature
```ts
function fromBIish(amount: BIish): BI {}
```

#### Description
Convert `BIish` to strict `BI`

### `fromBP`

#### Signature
```ts
function fromBP(percentInBP: BI, percentDecimals = 2): number {}
```

#### Description
Convert BigPercent to number, by default percent decimals equal 2

## Formatting

### `formattedNumber`

#### Signature
```ts
function formattedNumber(
  value: number,
  formatOptions?: Intl.NumberFormatOptions,
): string {}
```

#### Description
Format number by `formatOptions`. By default:
```ts
const defaultOptions = {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}
```

### `formattedDecimals`

#### Signature
```ts
function formattedDecimals(
  amountTKN: BIish,
  decimals: number,
  formatOptions?: Intl.NumberFormatOptions,
): string {}
```

#### Description
Format `BI` by `decimals` and `formatOptions`. By default:
```ts
const defaultOptions = {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}
```

## BIMath

### `BIMath.min`

#### Signature
```ts
BIMath.min(...values: BI[]): BI
```

#### Description
Return min of provided values

### `BIMath.max`

#### Signature
```ts
BIMath.max(...values: BI[]): BI
```

#### Description
Return max of provided values
