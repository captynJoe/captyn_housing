
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Property
 * 
 */
export type Property = $Result.DefaultSelection<Prisma.$PropertyPayload>
/**
 * Model Unit
 * 
 */
export type Unit = $Result.DefaultSelection<Prisma.$UnitPayload>
/**
 * Model RentPayment
 * 
 */
export type RentPayment = $Result.DefaultSelection<Prisma.$RentPaymentPayload>
/**
 * Model WaterBill
 * 
 */
export type WaterBill = $Result.DefaultSelection<Prisma.$WaterBillPayload>
/**
 * Model ElectricityBill
 * 
 */
export type ElectricityBill = $Result.DefaultSelection<Prisma.$ElectricityBillPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model POI
 * 
 */
export type POI = $Result.DefaultSelection<Prisma.$POIPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  TENANT: 'TENANT',
  LANDLORD: 'LANDLORD',
  ADMIN: 'ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]


export const PaymentStatus: {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE'
};

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type PaymentStatus = $Enums.PaymentStatus

export const PaymentStatus: typeof $Enums.PaymentStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.property`: Exposes CRUD operations for the **Property** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Properties
    * const properties = await prisma.property.findMany()
    * ```
    */
  get property(): Prisma.PropertyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.unit`: Exposes CRUD operations for the **Unit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Units
    * const units = await prisma.unit.findMany()
    * ```
    */
  get unit(): Prisma.UnitDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.rentPayment`: Exposes CRUD operations for the **RentPayment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RentPayments
    * const rentPayments = await prisma.rentPayment.findMany()
    * ```
    */
  get rentPayment(): Prisma.RentPaymentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.waterBill`: Exposes CRUD operations for the **WaterBill** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WaterBills
    * const waterBills = await prisma.waterBill.findMany()
    * ```
    */
  get waterBill(): Prisma.WaterBillDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.electricityBill`: Exposes CRUD operations for the **ElectricityBill** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ElectricityBills
    * const electricityBills = await prisma.electricityBill.findMany()
    * ```
    */
  get electricityBill(): Prisma.ElectricityBillDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pOI`: Exposes CRUD operations for the **POI** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more POIS
    * const pOIS = await prisma.pOI.findMany()
    * ```
    */
  get pOI(): Prisma.POIDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Property: 'Property',
    Unit: 'Unit',
    RentPayment: 'RentPayment',
    WaterBill: 'WaterBill',
    ElectricityBill: 'ElectricityBill',
    Notification: 'Notification',
    POI: 'POI'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "property" | "unit" | "rentPayment" | "waterBill" | "electricityBill" | "notification" | "pOI"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Property: {
        payload: Prisma.$PropertyPayload<ExtArgs>
        fields: Prisma.PropertyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PropertyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PropertyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>
          }
          findFirst: {
            args: Prisma.PropertyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PropertyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>
          }
          findMany: {
            args: Prisma.PropertyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>[]
          }
          create: {
            args: Prisma.PropertyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>
          }
          createMany: {
            args: Prisma.PropertyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PropertyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>[]
          }
          delete: {
            args: Prisma.PropertyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>
          }
          update: {
            args: Prisma.PropertyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>
          }
          deleteMany: {
            args: Prisma.PropertyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PropertyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PropertyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>[]
          }
          upsert: {
            args: Prisma.PropertyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PropertyPayload>
          }
          aggregate: {
            args: Prisma.PropertyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProperty>
          }
          groupBy: {
            args: Prisma.PropertyGroupByArgs<ExtArgs>
            result: $Utils.Optional<PropertyGroupByOutputType>[]
          }
          count: {
            args: Prisma.PropertyCountArgs<ExtArgs>
            result: $Utils.Optional<PropertyCountAggregateOutputType> | number
          }
        }
      }
      Unit: {
        payload: Prisma.$UnitPayload<ExtArgs>
        fields: Prisma.UnitFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UnitFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UnitFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>
          }
          findFirst: {
            args: Prisma.UnitFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UnitFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>
          }
          findMany: {
            args: Prisma.UnitFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>[]
          }
          create: {
            args: Prisma.UnitCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>
          }
          createMany: {
            args: Prisma.UnitCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UnitCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>[]
          }
          delete: {
            args: Prisma.UnitDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>
          }
          update: {
            args: Prisma.UnitUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>
          }
          deleteMany: {
            args: Prisma.UnitDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UnitUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UnitUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>[]
          }
          upsert: {
            args: Prisma.UnitUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitPayload>
          }
          aggregate: {
            args: Prisma.UnitAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUnit>
          }
          groupBy: {
            args: Prisma.UnitGroupByArgs<ExtArgs>
            result: $Utils.Optional<UnitGroupByOutputType>[]
          }
          count: {
            args: Prisma.UnitCountArgs<ExtArgs>
            result: $Utils.Optional<UnitCountAggregateOutputType> | number
          }
        }
      }
      RentPayment: {
        payload: Prisma.$RentPaymentPayload<ExtArgs>
        fields: Prisma.RentPaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RentPaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RentPaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>
          }
          findFirst: {
            args: Prisma.RentPaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RentPaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>
          }
          findMany: {
            args: Prisma.RentPaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>[]
          }
          create: {
            args: Prisma.RentPaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>
          }
          createMany: {
            args: Prisma.RentPaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RentPaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>[]
          }
          delete: {
            args: Prisma.RentPaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>
          }
          update: {
            args: Prisma.RentPaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>
          }
          deleteMany: {
            args: Prisma.RentPaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RentPaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RentPaymentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>[]
          }
          upsert: {
            args: Prisma.RentPaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RentPaymentPayload>
          }
          aggregate: {
            args: Prisma.RentPaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRentPayment>
          }
          groupBy: {
            args: Prisma.RentPaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<RentPaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.RentPaymentCountArgs<ExtArgs>
            result: $Utils.Optional<RentPaymentCountAggregateOutputType> | number
          }
        }
      }
      WaterBill: {
        payload: Prisma.$WaterBillPayload<ExtArgs>
        fields: Prisma.WaterBillFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WaterBillFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WaterBillFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>
          }
          findFirst: {
            args: Prisma.WaterBillFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WaterBillFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>
          }
          findMany: {
            args: Prisma.WaterBillFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>[]
          }
          create: {
            args: Prisma.WaterBillCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>
          }
          createMany: {
            args: Prisma.WaterBillCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WaterBillCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>[]
          }
          delete: {
            args: Prisma.WaterBillDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>
          }
          update: {
            args: Prisma.WaterBillUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>
          }
          deleteMany: {
            args: Prisma.WaterBillDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WaterBillUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WaterBillUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>[]
          }
          upsert: {
            args: Prisma.WaterBillUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterBillPayload>
          }
          aggregate: {
            args: Prisma.WaterBillAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWaterBill>
          }
          groupBy: {
            args: Prisma.WaterBillGroupByArgs<ExtArgs>
            result: $Utils.Optional<WaterBillGroupByOutputType>[]
          }
          count: {
            args: Prisma.WaterBillCountArgs<ExtArgs>
            result: $Utils.Optional<WaterBillCountAggregateOutputType> | number
          }
        }
      }
      ElectricityBill: {
        payload: Prisma.$ElectricityBillPayload<ExtArgs>
        fields: Prisma.ElectricityBillFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ElectricityBillFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ElectricityBillFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>
          }
          findFirst: {
            args: Prisma.ElectricityBillFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ElectricityBillFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>
          }
          findMany: {
            args: Prisma.ElectricityBillFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>[]
          }
          create: {
            args: Prisma.ElectricityBillCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>
          }
          createMany: {
            args: Prisma.ElectricityBillCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ElectricityBillCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>[]
          }
          delete: {
            args: Prisma.ElectricityBillDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>
          }
          update: {
            args: Prisma.ElectricityBillUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>
          }
          deleteMany: {
            args: Prisma.ElectricityBillDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ElectricityBillUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ElectricityBillUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>[]
          }
          upsert: {
            args: Prisma.ElectricityBillUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElectricityBillPayload>
          }
          aggregate: {
            args: Prisma.ElectricityBillAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateElectricityBill>
          }
          groupBy: {
            args: Prisma.ElectricityBillGroupByArgs<ExtArgs>
            result: $Utils.Optional<ElectricityBillGroupByOutputType>[]
          }
          count: {
            args: Prisma.ElectricityBillCountArgs<ExtArgs>
            result: $Utils.Optional<ElectricityBillCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      POI: {
        payload: Prisma.$POIPayload<ExtArgs>
        fields: Prisma.POIFieldRefs
        operations: {
          findUnique: {
            args: Prisma.POIFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.POIFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>
          }
          findFirst: {
            args: Prisma.POIFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.POIFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>
          }
          findMany: {
            args: Prisma.POIFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>[]
          }
          create: {
            args: Prisma.POICreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>
          }
          createMany: {
            args: Prisma.POICreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.POICreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>[]
          }
          delete: {
            args: Prisma.POIDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>
          }
          update: {
            args: Prisma.POIUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>
          }
          deleteMany: {
            args: Prisma.POIDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.POIUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.POIUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>[]
          }
          upsert: {
            args: Prisma.POIUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$POIPayload>
          }
          aggregate: {
            args: Prisma.POIAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePOI>
          }
          groupBy: {
            args: Prisma.POIGroupByArgs<ExtArgs>
            result: $Utils.Optional<POIGroupByOutputType>[]
          }
          count: {
            args: Prisma.POICountArgs<ExtArgs>
            result: $Utils.Optional<POICountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    property?: PropertyOmit
    unit?: UnitOmit
    rentPayment?: RentPaymentOmit
    waterBill?: WaterBillOmit
    electricityBill?: ElectricityBillOmit
    notification?: NotificationOmit
    pOI?: POIOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    properties: number
    units: number
    payments: number
    waterBills: number
    electricityBills: number
    notifications: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    properties?: boolean | UserCountOutputTypeCountPropertiesArgs
    units?: boolean | UserCountOutputTypeCountUnitsArgs
    payments?: boolean | UserCountOutputTypeCountPaymentsArgs
    waterBills?: boolean | UserCountOutputTypeCountWaterBillsArgs
    electricityBills?: boolean | UserCountOutputTypeCountElectricityBillsArgs
    notifications?: boolean | UserCountOutputTypeCountNotificationsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPropertiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PropertyWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUnitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RentPaymentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWaterBillsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WaterBillWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountElectricityBillsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ElectricityBillWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
  }


  /**
   * Count Type PropertyCountOutputType
   */

  export type PropertyCountOutputType = {
    units: number
  }

  export type PropertyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    units?: boolean | PropertyCountOutputTypeCountUnitsArgs
  }

  // Custom InputTypes
  /**
   * PropertyCountOutputType without action
   */
  export type PropertyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyCountOutputType
     */
    select?: PropertyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PropertyCountOutputType without action
   */
  export type PropertyCountOutputTypeCountUnitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitWhereInput
  }


  /**
   * Count Type UnitCountOutputType
   */

  export type UnitCountOutputType = {
    rentPayments: number
  }

  export type UnitCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rentPayments?: boolean | UnitCountOutputTypeCountRentPaymentsArgs
  }

  // Custom InputTypes
  /**
   * UnitCountOutputType without action
   */
  export type UnitCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitCountOutputType
     */
    select?: UnitCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UnitCountOutputType without action
   */
  export type UnitCountOutputTypeCountRentPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RentPaymentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    email: string | null
    password: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    email: string | null
    password: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    email: string
    password: string
    role: $Enums.Role
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    properties?: boolean | User$propertiesArgs<ExtArgs>
    units?: boolean | User$unitsArgs<ExtArgs>
    payments?: boolean | User$paymentsArgs<ExtArgs>
    waterBills?: boolean | User$waterBillsArgs<ExtArgs>
    electricityBills?: boolean | User$electricityBillsArgs<ExtArgs>
    notifications?: boolean | User$notificationsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    properties?: boolean | User$propertiesArgs<ExtArgs>
    units?: boolean | User$unitsArgs<ExtArgs>
    payments?: boolean | User$paymentsArgs<ExtArgs>
    waterBills?: boolean | User$waterBillsArgs<ExtArgs>
    electricityBills?: boolean | User$electricityBillsArgs<ExtArgs>
    notifications?: boolean | User$notificationsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      properties: Prisma.$PropertyPayload<ExtArgs>[]
      units: Prisma.$UnitPayload<ExtArgs>[]
      payments: Prisma.$RentPaymentPayload<ExtArgs>[]
      waterBills: Prisma.$WaterBillPayload<ExtArgs>[]
      electricityBills: Prisma.$ElectricityBillPayload<ExtArgs>[]
      notifications: Prisma.$NotificationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      email: string
      password: string
      role: $Enums.Role
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    properties<T extends User$propertiesArgs<ExtArgs> = {}>(args?: Subset<T, User$propertiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    units<T extends User$unitsArgs<ExtArgs> = {}>(args?: Subset<T, User$unitsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    payments<T extends User$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, User$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    waterBills<T extends User$waterBillsArgs<ExtArgs> = {}>(args?: Subset<T, User$waterBillsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    electricityBills<T extends User$electricityBillsArgs<ExtArgs> = {}>(args?: Subset<T, User$electricityBillsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notifications<T extends User$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, User$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.properties
   */
  export type User$propertiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    where?: PropertyWhereInput
    orderBy?: PropertyOrderByWithRelationInput | PropertyOrderByWithRelationInput[]
    cursor?: PropertyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PropertyScalarFieldEnum | PropertyScalarFieldEnum[]
  }

  /**
   * User.units
   */
  export type User$unitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    where?: UnitWhereInput
    orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[]
    cursor?: UnitWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UnitScalarFieldEnum | UnitScalarFieldEnum[]
  }

  /**
   * User.payments
   */
  export type User$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    where?: RentPaymentWhereInput
    orderBy?: RentPaymentOrderByWithRelationInput | RentPaymentOrderByWithRelationInput[]
    cursor?: RentPaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RentPaymentScalarFieldEnum | RentPaymentScalarFieldEnum[]
  }

  /**
   * User.waterBills
   */
  export type User$waterBillsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    where?: WaterBillWhereInput
    orderBy?: WaterBillOrderByWithRelationInput | WaterBillOrderByWithRelationInput[]
    cursor?: WaterBillWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WaterBillScalarFieldEnum | WaterBillScalarFieldEnum[]
  }

  /**
   * User.electricityBills
   */
  export type User$electricityBillsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    where?: ElectricityBillWhereInput
    orderBy?: ElectricityBillOrderByWithRelationInput | ElectricityBillOrderByWithRelationInput[]
    cursor?: ElectricityBillWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ElectricityBillScalarFieldEnum | ElectricityBillScalarFieldEnum[]
  }

  /**
   * User.notifications
   */
  export type User$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    cursor?: NotificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Property
   */

  export type AggregateProperty = {
    _count: PropertyCountAggregateOutputType | null
    _avg: PropertyAvgAggregateOutputType | null
    _sum: PropertySumAggregateOutputType | null
    _min: PropertyMinAggregateOutputType | null
    _max: PropertyMaxAggregateOutputType | null
  }

  export type PropertyAvgAggregateOutputType = {
    id: number | null
    landlordId: number | null
  }

  export type PropertySumAggregateOutputType = {
    id: number | null
    landlordId: number | null
  }

  export type PropertyMinAggregateOutputType = {
    id: number | null
    name: string | null
    address: string | null
    landlordId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PropertyMaxAggregateOutputType = {
    id: number | null
    name: string | null
    address: string | null
    landlordId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PropertyCountAggregateOutputType = {
    id: number
    name: number
    address: number
    landlordId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PropertyAvgAggregateInputType = {
    id?: true
    landlordId?: true
  }

  export type PropertySumAggregateInputType = {
    id?: true
    landlordId?: true
  }

  export type PropertyMinAggregateInputType = {
    id?: true
    name?: true
    address?: true
    landlordId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PropertyMaxAggregateInputType = {
    id?: true
    name?: true
    address?: true
    landlordId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PropertyCountAggregateInputType = {
    id?: true
    name?: true
    address?: true
    landlordId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PropertyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Property to aggregate.
     */
    where?: PropertyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Properties to fetch.
     */
    orderBy?: PropertyOrderByWithRelationInput | PropertyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PropertyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Properties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Properties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Properties
    **/
    _count?: true | PropertyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PropertyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PropertySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PropertyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PropertyMaxAggregateInputType
  }

  export type GetPropertyAggregateType<T extends PropertyAggregateArgs> = {
        [P in keyof T & keyof AggregateProperty]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProperty[P]>
      : GetScalarType<T[P], AggregateProperty[P]>
  }




  export type PropertyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PropertyWhereInput
    orderBy?: PropertyOrderByWithAggregationInput | PropertyOrderByWithAggregationInput[]
    by: PropertyScalarFieldEnum[] | PropertyScalarFieldEnum
    having?: PropertyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PropertyCountAggregateInputType | true
    _avg?: PropertyAvgAggregateInputType
    _sum?: PropertySumAggregateInputType
    _min?: PropertyMinAggregateInputType
    _max?: PropertyMaxAggregateInputType
  }

  export type PropertyGroupByOutputType = {
    id: number
    name: string
    address: string
    landlordId: number
    createdAt: Date
    updatedAt: Date
    _count: PropertyCountAggregateOutputType | null
    _avg: PropertyAvgAggregateOutputType | null
    _sum: PropertySumAggregateOutputType | null
    _min: PropertyMinAggregateOutputType | null
    _max: PropertyMaxAggregateOutputType | null
  }

  type GetPropertyGroupByPayload<T extends PropertyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PropertyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PropertyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PropertyGroupByOutputType[P]>
            : GetScalarType<T[P], PropertyGroupByOutputType[P]>
        }
      >
    >


  export type PropertySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    landlordId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    landlord?: boolean | UserDefaultArgs<ExtArgs>
    units?: boolean | Property$unitsArgs<ExtArgs>
    _count?: boolean | PropertyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["property"]>

  export type PropertySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    landlordId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    landlord?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["property"]>

  export type PropertySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    landlordId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    landlord?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["property"]>

  export type PropertySelectScalar = {
    id?: boolean
    name?: boolean
    address?: boolean
    landlordId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PropertyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "address" | "landlordId" | "createdAt" | "updatedAt", ExtArgs["result"]["property"]>
  export type PropertyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    landlord?: boolean | UserDefaultArgs<ExtArgs>
    units?: boolean | Property$unitsArgs<ExtArgs>
    _count?: boolean | PropertyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PropertyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    landlord?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PropertyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    landlord?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PropertyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Property"
    objects: {
      landlord: Prisma.$UserPayload<ExtArgs>
      units: Prisma.$UnitPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      address: string
      landlordId: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["property"]>
    composites: {}
  }

  type PropertyGetPayload<S extends boolean | null | undefined | PropertyDefaultArgs> = $Result.GetResult<Prisma.$PropertyPayload, S>

  type PropertyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PropertyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PropertyCountAggregateInputType | true
    }

  export interface PropertyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Property'], meta: { name: 'Property' } }
    /**
     * Find zero or one Property that matches the filter.
     * @param {PropertyFindUniqueArgs} args - Arguments to find a Property
     * @example
     * // Get one Property
     * const property = await prisma.property.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PropertyFindUniqueArgs>(args: SelectSubset<T, PropertyFindUniqueArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Property that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PropertyFindUniqueOrThrowArgs} args - Arguments to find a Property
     * @example
     * // Get one Property
     * const property = await prisma.property.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PropertyFindUniqueOrThrowArgs>(args: SelectSubset<T, PropertyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Property that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyFindFirstArgs} args - Arguments to find a Property
     * @example
     * // Get one Property
     * const property = await prisma.property.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PropertyFindFirstArgs>(args?: SelectSubset<T, PropertyFindFirstArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Property that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyFindFirstOrThrowArgs} args - Arguments to find a Property
     * @example
     * // Get one Property
     * const property = await prisma.property.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PropertyFindFirstOrThrowArgs>(args?: SelectSubset<T, PropertyFindFirstOrThrowArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Properties that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Properties
     * const properties = await prisma.property.findMany()
     * 
     * // Get first 10 Properties
     * const properties = await prisma.property.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const propertyWithIdOnly = await prisma.property.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PropertyFindManyArgs>(args?: SelectSubset<T, PropertyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Property.
     * @param {PropertyCreateArgs} args - Arguments to create a Property.
     * @example
     * // Create one Property
     * const Property = await prisma.property.create({
     *   data: {
     *     // ... data to create a Property
     *   }
     * })
     * 
     */
    create<T extends PropertyCreateArgs>(args: SelectSubset<T, PropertyCreateArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Properties.
     * @param {PropertyCreateManyArgs} args - Arguments to create many Properties.
     * @example
     * // Create many Properties
     * const property = await prisma.property.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PropertyCreateManyArgs>(args?: SelectSubset<T, PropertyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Properties and returns the data saved in the database.
     * @param {PropertyCreateManyAndReturnArgs} args - Arguments to create many Properties.
     * @example
     * // Create many Properties
     * const property = await prisma.property.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Properties and only return the `id`
     * const propertyWithIdOnly = await prisma.property.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PropertyCreateManyAndReturnArgs>(args?: SelectSubset<T, PropertyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Property.
     * @param {PropertyDeleteArgs} args - Arguments to delete one Property.
     * @example
     * // Delete one Property
     * const Property = await prisma.property.delete({
     *   where: {
     *     // ... filter to delete one Property
     *   }
     * })
     * 
     */
    delete<T extends PropertyDeleteArgs>(args: SelectSubset<T, PropertyDeleteArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Property.
     * @param {PropertyUpdateArgs} args - Arguments to update one Property.
     * @example
     * // Update one Property
     * const property = await prisma.property.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PropertyUpdateArgs>(args: SelectSubset<T, PropertyUpdateArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Properties.
     * @param {PropertyDeleteManyArgs} args - Arguments to filter Properties to delete.
     * @example
     * // Delete a few Properties
     * const { count } = await prisma.property.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PropertyDeleteManyArgs>(args?: SelectSubset<T, PropertyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Properties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Properties
     * const property = await prisma.property.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PropertyUpdateManyArgs>(args: SelectSubset<T, PropertyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Properties and returns the data updated in the database.
     * @param {PropertyUpdateManyAndReturnArgs} args - Arguments to update many Properties.
     * @example
     * // Update many Properties
     * const property = await prisma.property.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Properties and only return the `id`
     * const propertyWithIdOnly = await prisma.property.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PropertyUpdateManyAndReturnArgs>(args: SelectSubset<T, PropertyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Property.
     * @param {PropertyUpsertArgs} args - Arguments to update or create a Property.
     * @example
     * // Update or create a Property
     * const property = await prisma.property.upsert({
     *   create: {
     *     // ... data to create a Property
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Property we want to update
     *   }
     * })
     */
    upsert<T extends PropertyUpsertArgs>(args: SelectSubset<T, PropertyUpsertArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Properties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyCountArgs} args - Arguments to filter Properties to count.
     * @example
     * // Count the number of Properties
     * const count = await prisma.property.count({
     *   where: {
     *     // ... the filter for the Properties we want to count
     *   }
     * })
    **/
    count<T extends PropertyCountArgs>(
      args?: Subset<T, PropertyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PropertyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Property.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PropertyAggregateArgs>(args: Subset<T, PropertyAggregateArgs>): Prisma.PrismaPromise<GetPropertyAggregateType<T>>

    /**
     * Group by Property.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PropertyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PropertyGroupByArgs['orderBy'] }
        : { orderBy?: PropertyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PropertyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPropertyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Property model
   */
  readonly fields: PropertyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Property.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PropertyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    landlord<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    units<T extends Property$unitsArgs<ExtArgs> = {}>(args?: Subset<T, Property$unitsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Property model
   */
  interface PropertyFieldRefs {
    readonly id: FieldRef<"Property", 'Int'>
    readonly name: FieldRef<"Property", 'String'>
    readonly address: FieldRef<"Property", 'String'>
    readonly landlordId: FieldRef<"Property", 'Int'>
    readonly createdAt: FieldRef<"Property", 'DateTime'>
    readonly updatedAt: FieldRef<"Property", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Property findUnique
   */
  export type PropertyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * Filter, which Property to fetch.
     */
    where: PropertyWhereUniqueInput
  }

  /**
   * Property findUniqueOrThrow
   */
  export type PropertyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * Filter, which Property to fetch.
     */
    where: PropertyWhereUniqueInput
  }

  /**
   * Property findFirst
   */
  export type PropertyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * Filter, which Property to fetch.
     */
    where?: PropertyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Properties to fetch.
     */
    orderBy?: PropertyOrderByWithRelationInput | PropertyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Properties.
     */
    cursor?: PropertyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Properties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Properties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Properties.
     */
    distinct?: PropertyScalarFieldEnum | PropertyScalarFieldEnum[]
  }

  /**
   * Property findFirstOrThrow
   */
  export type PropertyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * Filter, which Property to fetch.
     */
    where?: PropertyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Properties to fetch.
     */
    orderBy?: PropertyOrderByWithRelationInput | PropertyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Properties.
     */
    cursor?: PropertyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Properties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Properties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Properties.
     */
    distinct?: PropertyScalarFieldEnum | PropertyScalarFieldEnum[]
  }

  /**
   * Property findMany
   */
  export type PropertyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * Filter, which Properties to fetch.
     */
    where?: PropertyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Properties to fetch.
     */
    orderBy?: PropertyOrderByWithRelationInput | PropertyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Properties.
     */
    cursor?: PropertyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Properties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Properties.
     */
    skip?: number
    distinct?: PropertyScalarFieldEnum | PropertyScalarFieldEnum[]
  }

  /**
   * Property create
   */
  export type PropertyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * The data needed to create a Property.
     */
    data: XOR<PropertyCreateInput, PropertyUncheckedCreateInput>
  }

  /**
   * Property createMany
   */
  export type PropertyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Properties.
     */
    data: PropertyCreateManyInput | PropertyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Property createManyAndReturn
   */
  export type PropertyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * The data used to create many Properties.
     */
    data: PropertyCreateManyInput | PropertyCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Property update
   */
  export type PropertyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * The data needed to update a Property.
     */
    data: XOR<PropertyUpdateInput, PropertyUncheckedUpdateInput>
    /**
     * Choose, which Property to update.
     */
    where: PropertyWhereUniqueInput
  }

  /**
   * Property updateMany
   */
  export type PropertyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Properties.
     */
    data: XOR<PropertyUpdateManyMutationInput, PropertyUncheckedUpdateManyInput>
    /**
     * Filter which Properties to update
     */
    where?: PropertyWhereInput
    /**
     * Limit how many Properties to update.
     */
    limit?: number
  }

  /**
   * Property updateManyAndReturn
   */
  export type PropertyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * The data used to update Properties.
     */
    data: XOR<PropertyUpdateManyMutationInput, PropertyUncheckedUpdateManyInput>
    /**
     * Filter which Properties to update
     */
    where?: PropertyWhereInput
    /**
     * Limit how many Properties to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Property upsert
   */
  export type PropertyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * The filter to search for the Property to update in case it exists.
     */
    where: PropertyWhereUniqueInput
    /**
     * In case the Property found by the `where` argument doesn't exist, create a new Property with this data.
     */
    create: XOR<PropertyCreateInput, PropertyUncheckedCreateInput>
    /**
     * In case the Property was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PropertyUpdateInput, PropertyUncheckedUpdateInput>
  }

  /**
   * Property delete
   */
  export type PropertyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
    /**
     * Filter which Property to delete.
     */
    where: PropertyWhereUniqueInput
  }

  /**
   * Property deleteMany
   */
  export type PropertyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Properties to delete
     */
    where?: PropertyWhereInput
    /**
     * Limit how many Properties to delete.
     */
    limit?: number
  }

  /**
   * Property.units
   */
  export type Property$unitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    where?: UnitWhereInput
    orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[]
    cursor?: UnitWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UnitScalarFieldEnum | UnitScalarFieldEnum[]
  }

  /**
   * Property without action
   */
  export type PropertyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: PropertySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Property
     */
    omit?: PropertyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PropertyInclude<ExtArgs> | null
  }


  /**
   * Model Unit
   */

  export type AggregateUnit = {
    _count: UnitCountAggregateOutputType | null
    _avg: UnitAvgAggregateOutputType | null
    _sum: UnitSumAggregateOutputType | null
    _min: UnitMinAggregateOutputType | null
    _max: UnitMaxAggregateOutputType | null
  }

  export type UnitAvgAggregateOutputType = {
    id: number | null
    propertyId: number | null
    tenantId: number | null
    rentAmount: number | null
  }

  export type UnitSumAggregateOutputType = {
    id: number | null
    propertyId: number | null
    tenantId: number | null
    rentAmount: number | null
  }

  export type UnitMinAggregateOutputType = {
    id: number | null
    propertyId: number | null
    tenantId: number | null
    rentAmount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UnitMaxAggregateOutputType = {
    id: number | null
    propertyId: number | null
    tenantId: number | null
    rentAmount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UnitCountAggregateOutputType = {
    id: number
    propertyId: number
    tenantId: number
    rentAmount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UnitAvgAggregateInputType = {
    id?: true
    propertyId?: true
    tenantId?: true
    rentAmount?: true
  }

  export type UnitSumAggregateInputType = {
    id?: true
    propertyId?: true
    tenantId?: true
    rentAmount?: true
  }

  export type UnitMinAggregateInputType = {
    id?: true
    propertyId?: true
    tenantId?: true
    rentAmount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UnitMaxAggregateInputType = {
    id?: true
    propertyId?: true
    tenantId?: true
    rentAmount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UnitCountAggregateInputType = {
    id?: true
    propertyId?: true
    tenantId?: true
    rentAmount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UnitAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Unit to aggregate.
     */
    where?: UnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Units to fetch.
     */
    orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Units from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Units.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Units
    **/
    _count?: true | UnitCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UnitAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UnitSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UnitMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UnitMaxAggregateInputType
  }

  export type GetUnitAggregateType<T extends UnitAggregateArgs> = {
        [P in keyof T & keyof AggregateUnit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUnit[P]>
      : GetScalarType<T[P], AggregateUnit[P]>
  }




  export type UnitGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitWhereInput
    orderBy?: UnitOrderByWithAggregationInput | UnitOrderByWithAggregationInput[]
    by: UnitScalarFieldEnum[] | UnitScalarFieldEnum
    having?: UnitScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UnitCountAggregateInputType | true
    _avg?: UnitAvgAggregateInputType
    _sum?: UnitSumAggregateInputType
    _min?: UnitMinAggregateInputType
    _max?: UnitMaxAggregateInputType
  }

  export type UnitGroupByOutputType = {
    id: number
    propertyId: number
    tenantId: number | null
    rentAmount: number
    createdAt: Date
    updatedAt: Date
    _count: UnitCountAggregateOutputType | null
    _avg: UnitAvgAggregateOutputType | null
    _sum: UnitSumAggregateOutputType | null
    _min: UnitMinAggregateOutputType | null
    _max: UnitMaxAggregateOutputType | null
  }

  type GetUnitGroupByPayload<T extends UnitGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UnitGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UnitGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UnitGroupByOutputType[P]>
            : GetScalarType<T[P], UnitGroupByOutputType[P]>
        }
      >
    >


  export type UnitSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    propertyId?: boolean
    tenantId?: boolean
    rentAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    property?: boolean | PropertyDefaultArgs<ExtArgs>
    tenant?: boolean | Unit$tenantArgs<ExtArgs>
    rentPayments?: boolean | Unit$rentPaymentsArgs<ExtArgs>
    _count?: boolean | UnitCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["unit"]>

  export type UnitSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    propertyId?: boolean
    tenantId?: boolean
    rentAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    property?: boolean | PropertyDefaultArgs<ExtArgs>
    tenant?: boolean | Unit$tenantArgs<ExtArgs>
  }, ExtArgs["result"]["unit"]>

  export type UnitSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    propertyId?: boolean
    tenantId?: boolean
    rentAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    property?: boolean | PropertyDefaultArgs<ExtArgs>
    tenant?: boolean | Unit$tenantArgs<ExtArgs>
  }, ExtArgs["result"]["unit"]>

  export type UnitSelectScalar = {
    id?: boolean
    propertyId?: boolean
    tenantId?: boolean
    rentAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UnitOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "propertyId" | "tenantId" | "rentAmount" | "createdAt" | "updatedAt", ExtArgs["result"]["unit"]>
  export type UnitInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    property?: boolean | PropertyDefaultArgs<ExtArgs>
    tenant?: boolean | Unit$tenantArgs<ExtArgs>
    rentPayments?: boolean | Unit$rentPaymentsArgs<ExtArgs>
    _count?: boolean | UnitCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UnitIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    property?: boolean | PropertyDefaultArgs<ExtArgs>
    tenant?: boolean | Unit$tenantArgs<ExtArgs>
  }
  export type UnitIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    property?: boolean | PropertyDefaultArgs<ExtArgs>
    tenant?: boolean | Unit$tenantArgs<ExtArgs>
  }

  export type $UnitPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Unit"
    objects: {
      property: Prisma.$PropertyPayload<ExtArgs>
      tenant: Prisma.$UserPayload<ExtArgs> | null
      rentPayments: Prisma.$RentPaymentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      propertyId: number
      tenantId: number | null
      rentAmount: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["unit"]>
    composites: {}
  }

  type UnitGetPayload<S extends boolean | null | undefined | UnitDefaultArgs> = $Result.GetResult<Prisma.$UnitPayload, S>

  type UnitCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UnitFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UnitCountAggregateInputType | true
    }

  export interface UnitDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Unit'], meta: { name: 'Unit' } }
    /**
     * Find zero or one Unit that matches the filter.
     * @param {UnitFindUniqueArgs} args - Arguments to find a Unit
     * @example
     * // Get one Unit
     * const unit = await prisma.unit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UnitFindUniqueArgs>(args: SelectSubset<T, UnitFindUniqueArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Unit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UnitFindUniqueOrThrowArgs} args - Arguments to find a Unit
     * @example
     * // Get one Unit
     * const unit = await prisma.unit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UnitFindUniqueOrThrowArgs>(args: SelectSubset<T, UnitFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Unit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitFindFirstArgs} args - Arguments to find a Unit
     * @example
     * // Get one Unit
     * const unit = await prisma.unit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UnitFindFirstArgs>(args?: SelectSubset<T, UnitFindFirstArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Unit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitFindFirstOrThrowArgs} args - Arguments to find a Unit
     * @example
     * // Get one Unit
     * const unit = await prisma.unit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UnitFindFirstOrThrowArgs>(args?: SelectSubset<T, UnitFindFirstOrThrowArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Units that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Units
     * const units = await prisma.unit.findMany()
     * 
     * // Get first 10 Units
     * const units = await prisma.unit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const unitWithIdOnly = await prisma.unit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UnitFindManyArgs>(args?: SelectSubset<T, UnitFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Unit.
     * @param {UnitCreateArgs} args - Arguments to create a Unit.
     * @example
     * // Create one Unit
     * const Unit = await prisma.unit.create({
     *   data: {
     *     // ... data to create a Unit
     *   }
     * })
     * 
     */
    create<T extends UnitCreateArgs>(args: SelectSubset<T, UnitCreateArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Units.
     * @param {UnitCreateManyArgs} args - Arguments to create many Units.
     * @example
     * // Create many Units
     * const unit = await prisma.unit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UnitCreateManyArgs>(args?: SelectSubset<T, UnitCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Units and returns the data saved in the database.
     * @param {UnitCreateManyAndReturnArgs} args - Arguments to create many Units.
     * @example
     * // Create many Units
     * const unit = await prisma.unit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Units and only return the `id`
     * const unitWithIdOnly = await prisma.unit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UnitCreateManyAndReturnArgs>(args?: SelectSubset<T, UnitCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Unit.
     * @param {UnitDeleteArgs} args - Arguments to delete one Unit.
     * @example
     * // Delete one Unit
     * const Unit = await prisma.unit.delete({
     *   where: {
     *     // ... filter to delete one Unit
     *   }
     * })
     * 
     */
    delete<T extends UnitDeleteArgs>(args: SelectSubset<T, UnitDeleteArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Unit.
     * @param {UnitUpdateArgs} args - Arguments to update one Unit.
     * @example
     * // Update one Unit
     * const unit = await prisma.unit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UnitUpdateArgs>(args: SelectSubset<T, UnitUpdateArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Units.
     * @param {UnitDeleteManyArgs} args - Arguments to filter Units to delete.
     * @example
     * // Delete a few Units
     * const { count } = await prisma.unit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UnitDeleteManyArgs>(args?: SelectSubset<T, UnitDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Units.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Units
     * const unit = await prisma.unit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UnitUpdateManyArgs>(args: SelectSubset<T, UnitUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Units and returns the data updated in the database.
     * @param {UnitUpdateManyAndReturnArgs} args - Arguments to update many Units.
     * @example
     * // Update many Units
     * const unit = await prisma.unit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Units and only return the `id`
     * const unitWithIdOnly = await prisma.unit.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UnitUpdateManyAndReturnArgs>(args: SelectSubset<T, UnitUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Unit.
     * @param {UnitUpsertArgs} args - Arguments to update or create a Unit.
     * @example
     * // Update or create a Unit
     * const unit = await prisma.unit.upsert({
     *   create: {
     *     // ... data to create a Unit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Unit we want to update
     *   }
     * })
     */
    upsert<T extends UnitUpsertArgs>(args: SelectSubset<T, UnitUpsertArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Units.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitCountArgs} args - Arguments to filter Units to count.
     * @example
     * // Count the number of Units
     * const count = await prisma.unit.count({
     *   where: {
     *     // ... the filter for the Units we want to count
     *   }
     * })
    **/
    count<T extends UnitCountArgs>(
      args?: Subset<T, UnitCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UnitCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Unit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UnitAggregateArgs>(args: Subset<T, UnitAggregateArgs>): Prisma.PrismaPromise<GetUnitAggregateType<T>>

    /**
     * Group by Unit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UnitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UnitGroupByArgs['orderBy'] }
        : { orderBy?: UnitGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UnitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUnitGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Unit model
   */
  readonly fields: UnitFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Unit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UnitClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    property<T extends PropertyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PropertyDefaultArgs<ExtArgs>>): Prisma__PropertyClient<$Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    tenant<T extends Unit$tenantArgs<ExtArgs> = {}>(args?: Subset<T, Unit$tenantArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    rentPayments<T extends Unit$rentPaymentsArgs<ExtArgs> = {}>(args?: Subset<T, Unit$rentPaymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Unit model
   */
  interface UnitFieldRefs {
    readonly id: FieldRef<"Unit", 'Int'>
    readonly propertyId: FieldRef<"Unit", 'Int'>
    readonly tenantId: FieldRef<"Unit", 'Int'>
    readonly rentAmount: FieldRef<"Unit", 'Float'>
    readonly createdAt: FieldRef<"Unit", 'DateTime'>
    readonly updatedAt: FieldRef<"Unit", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Unit findUnique
   */
  export type UnitFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * Filter, which Unit to fetch.
     */
    where: UnitWhereUniqueInput
  }

  /**
   * Unit findUniqueOrThrow
   */
  export type UnitFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * Filter, which Unit to fetch.
     */
    where: UnitWhereUniqueInput
  }

  /**
   * Unit findFirst
   */
  export type UnitFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * Filter, which Unit to fetch.
     */
    where?: UnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Units to fetch.
     */
    orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Units.
     */
    cursor?: UnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Units from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Units.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Units.
     */
    distinct?: UnitScalarFieldEnum | UnitScalarFieldEnum[]
  }

  /**
   * Unit findFirstOrThrow
   */
  export type UnitFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * Filter, which Unit to fetch.
     */
    where?: UnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Units to fetch.
     */
    orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Units.
     */
    cursor?: UnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Units from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Units.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Units.
     */
    distinct?: UnitScalarFieldEnum | UnitScalarFieldEnum[]
  }

  /**
   * Unit findMany
   */
  export type UnitFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * Filter, which Units to fetch.
     */
    where?: UnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Units to fetch.
     */
    orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Units.
     */
    cursor?: UnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Units from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Units.
     */
    skip?: number
    distinct?: UnitScalarFieldEnum | UnitScalarFieldEnum[]
  }

  /**
   * Unit create
   */
  export type UnitCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * The data needed to create a Unit.
     */
    data: XOR<UnitCreateInput, UnitUncheckedCreateInput>
  }

  /**
   * Unit createMany
   */
  export type UnitCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Units.
     */
    data: UnitCreateManyInput | UnitCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Unit createManyAndReturn
   */
  export type UnitCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * The data used to create many Units.
     */
    data: UnitCreateManyInput | UnitCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Unit update
   */
  export type UnitUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * The data needed to update a Unit.
     */
    data: XOR<UnitUpdateInput, UnitUncheckedUpdateInput>
    /**
     * Choose, which Unit to update.
     */
    where: UnitWhereUniqueInput
  }

  /**
   * Unit updateMany
   */
  export type UnitUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Units.
     */
    data: XOR<UnitUpdateManyMutationInput, UnitUncheckedUpdateManyInput>
    /**
     * Filter which Units to update
     */
    where?: UnitWhereInput
    /**
     * Limit how many Units to update.
     */
    limit?: number
  }

  /**
   * Unit updateManyAndReturn
   */
  export type UnitUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * The data used to update Units.
     */
    data: XOR<UnitUpdateManyMutationInput, UnitUncheckedUpdateManyInput>
    /**
     * Filter which Units to update
     */
    where?: UnitWhereInput
    /**
     * Limit how many Units to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Unit upsert
   */
  export type UnitUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * The filter to search for the Unit to update in case it exists.
     */
    where: UnitWhereUniqueInput
    /**
     * In case the Unit found by the `where` argument doesn't exist, create a new Unit with this data.
     */
    create: XOR<UnitCreateInput, UnitUncheckedCreateInput>
    /**
     * In case the Unit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UnitUpdateInput, UnitUncheckedUpdateInput>
  }

  /**
   * Unit delete
   */
  export type UnitDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
    /**
     * Filter which Unit to delete.
     */
    where: UnitWhereUniqueInput
  }

  /**
   * Unit deleteMany
   */
  export type UnitDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Units to delete
     */
    where?: UnitWhereInput
    /**
     * Limit how many Units to delete.
     */
    limit?: number
  }

  /**
   * Unit.tenant
   */
  export type Unit$tenantArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Unit.rentPayments
   */
  export type Unit$rentPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    where?: RentPaymentWhereInput
    orderBy?: RentPaymentOrderByWithRelationInput | RentPaymentOrderByWithRelationInput[]
    cursor?: RentPaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RentPaymentScalarFieldEnum | RentPaymentScalarFieldEnum[]
  }

  /**
   * Unit without action
   */
  export type UnitDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unit
     */
    select?: UnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Unit
     */
    omit?: UnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitInclude<ExtArgs> | null
  }


  /**
   * Model RentPayment
   */

  export type AggregateRentPayment = {
    _count: RentPaymentCountAggregateOutputType | null
    _avg: RentPaymentAvgAggregateOutputType | null
    _sum: RentPaymentSumAggregateOutputType | null
    _min: RentPaymentMinAggregateOutputType | null
    _max: RentPaymentMaxAggregateOutputType | null
  }

  export type RentPaymentAvgAggregateOutputType = {
    id: number | null
    tenantId: number | null
    unitId: number | null
    amount: number | null
    penalty: number | null
  }

  export type RentPaymentSumAggregateOutputType = {
    id: number | null
    tenantId: number | null
    unitId: number | null
    amount: number | null
    penalty: number | null
  }

  export type RentPaymentMinAggregateOutputType = {
    id: number | null
    tenantId: number | null
    unitId: number | null
    amount: number | null
    dueDate: Date | null
    status: $Enums.PaymentStatus | null
    penalty: number | null
    paidAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RentPaymentMaxAggregateOutputType = {
    id: number | null
    tenantId: number | null
    unitId: number | null
    amount: number | null
    dueDate: Date | null
    status: $Enums.PaymentStatus | null
    penalty: number | null
    paidAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RentPaymentCountAggregateOutputType = {
    id: number
    tenantId: number
    unitId: number
    amount: number
    dueDate: number
    status: number
    penalty: number
    paidAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RentPaymentAvgAggregateInputType = {
    id?: true
    tenantId?: true
    unitId?: true
    amount?: true
    penalty?: true
  }

  export type RentPaymentSumAggregateInputType = {
    id?: true
    tenantId?: true
    unitId?: true
    amount?: true
    penalty?: true
  }

  export type RentPaymentMinAggregateInputType = {
    id?: true
    tenantId?: true
    unitId?: true
    amount?: true
    dueDate?: true
    status?: true
    penalty?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RentPaymentMaxAggregateInputType = {
    id?: true
    tenantId?: true
    unitId?: true
    amount?: true
    dueDate?: true
    status?: true
    penalty?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RentPaymentCountAggregateInputType = {
    id?: true
    tenantId?: true
    unitId?: true
    amount?: true
    dueDate?: true
    status?: true
    penalty?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RentPaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RentPayment to aggregate.
     */
    where?: RentPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RentPayments to fetch.
     */
    orderBy?: RentPaymentOrderByWithRelationInput | RentPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RentPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RentPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RentPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RentPayments
    **/
    _count?: true | RentPaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RentPaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RentPaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RentPaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RentPaymentMaxAggregateInputType
  }

  export type GetRentPaymentAggregateType<T extends RentPaymentAggregateArgs> = {
        [P in keyof T & keyof AggregateRentPayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRentPayment[P]>
      : GetScalarType<T[P], AggregateRentPayment[P]>
  }




  export type RentPaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RentPaymentWhereInput
    orderBy?: RentPaymentOrderByWithAggregationInput | RentPaymentOrderByWithAggregationInput[]
    by: RentPaymentScalarFieldEnum[] | RentPaymentScalarFieldEnum
    having?: RentPaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RentPaymentCountAggregateInputType | true
    _avg?: RentPaymentAvgAggregateInputType
    _sum?: RentPaymentSumAggregateInputType
    _min?: RentPaymentMinAggregateInputType
    _max?: RentPaymentMaxAggregateInputType
  }

  export type RentPaymentGroupByOutputType = {
    id: number
    tenantId: number
    unitId: number
    amount: number
    dueDate: Date
    status: $Enums.PaymentStatus
    penalty: number
    paidAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: RentPaymentCountAggregateOutputType | null
    _avg: RentPaymentAvgAggregateOutputType | null
    _sum: RentPaymentSumAggregateOutputType | null
    _min: RentPaymentMinAggregateOutputType | null
    _max: RentPaymentMaxAggregateOutputType | null
  }

  type GetRentPaymentGroupByPayload<T extends RentPaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RentPaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RentPaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RentPaymentGroupByOutputType[P]>
            : GetScalarType<T[P], RentPaymentGroupByOutputType[P]>
        }
      >
    >


  export type RentPaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    unitId?: boolean
    amount?: boolean
    dueDate?: boolean
    status?: boolean
    penalty?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
    unit?: boolean | UnitDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rentPayment"]>

  export type RentPaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    unitId?: boolean
    amount?: boolean
    dueDate?: boolean
    status?: boolean
    penalty?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
    unit?: boolean | UnitDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rentPayment"]>

  export type RentPaymentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    unitId?: boolean
    amount?: boolean
    dueDate?: boolean
    status?: boolean
    penalty?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
    unit?: boolean | UnitDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rentPayment"]>

  export type RentPaymentSelectScalar = {
    id?: boolean
    tenantId?: boolean
    unitId?: boolean
    amount?: boolean
    dueDate?: boolean
    status?: boolean
    penalty?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RentPaymentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "unitId" | "amount" | "dueDate" | "status" | "penalty" | "paidAt" | "createdAt" | "updatedAt", ExtArgs["result"]["rentPayment"]>
  export type RentPaymentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
    unit?: boolean | UnitDefaultArgs<ExtArgs>
  }
  export type RentPaymentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
    unit?: boolean | UnitDefaultArgs<ExtArgs>
  }
  export type RentPaymentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
    unit?: boolean | UnitDefaultArgs<ExtArgs>
  }

  export type $RentPaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RentPayment"
    objects: {
      tenant: Prisma.$UserPayload<ExtArgs>
      unit: Prisma.$UnitPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      tenantId: number
      unitId: number
      amount: number
      dueDate: Date
      status: $Enums.PaymentStatus
      penalty: number
      paidAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["rentPayment"]>
    composites: {}
  }

  type RentPaymentGetPayload<S extends boolean | null | undefined | RentPaymentDefaultArgs> = $Result.GetResult<Prisma.$RentPaymentPayload, S>

  type RentPaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RentPaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RentPaymentCountAggregateInputType | true
    }

  export interface RentPaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RentPayment'], meta: { name: 'RentPayment' } }
    /**
     * Find zero or one RentPayment that matches the filter.
     * @param {RentPaymentFindUniqueArgs} args - Arguments to find a RentPayment
     * @example
     * // Get one RentPayment
     * const rentPayment = await prisma.rentPayment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RentPaymentFindUniqueArgs>(args: SelectSubset<T, RentPaymentFindUniqueArgs<ExtArgs>>): Prisma__RentPaymentClient<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RentPayment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RentPaymentFindUniqueOrThrowArgs} args - Arguments to find a RentPayment
     * @example
     * // Get one RentPayment
     * const rentPayment = await prisma.rentPayment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RentPaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, RentPaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RentPaymentClient<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RentPayment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RentPaymentFindFirstArgs} args - Arguments to find a RentPayment
     * @example
     * // Get one RentPayment
     * const rentPayment = await prisma.rentPayment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RentPaymentFindFirstArgs>(args?: SelectSubset<T, RentPaymentFindFirstArgs<ExtArgs>>): Prisma__RentPaymentClient<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RentPayment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RentPaymentFindFirstOrThrowArgs} args - Arguments to find a RentPayment
     * @example
     * // Get one RentPayment
     * const rentPayment = await prisma.rentPayment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RentPaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, RentPaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__RentPaymentClient<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RentPayments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RentPaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RentPayments
     * const rentPayments = await prisma.rentPayment.findMany()
     * 
     * // Get first 10 RentPayments
     * const rentPayments = await prisma.rentPayment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rentPaymentWithIdOnly = await prisma.rentPayment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RentPaymentFindManyArgs>(args?: SelectSubset<T, RentPaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RentPayment.
     * @param {RentPaymentCreateArgs} args - Arguments to create a RentPayment.
     * @example
     * // Create one RentPayment
     * const RentPayment = await prisma.rentPayment.create({
     *   data: {
     *     // ... data to create a RentPayment
     *   }
     * })
     * 
     */
    create<T extends RentPaymentCreateArgs>(args: SelectSubset<T, RentPaymentCreateArgs<ExtArgs>>): Prisma__RentPaymentClient<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RentPayments.
     * @param {RentPaymentCreateManyArgs} args - Arguments to create many RentPayments.
     * @example
     * // Create many RentPayments
     * const rentPayment = await prisma.rentPayment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RentPaymentCreateManyArgs>(args?: SelectSubset<T, RentPaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RentPayments and returns the data saved in the database.
     * @param {RentPaymentCreateManyAndReturnArgs} args - Arguments to create many RentPayments.
     * @example
     * // Create many RentPayments
     * const rentPayment = await prisma.rentPayment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RentPayments and only return the `id`
     * const rentPaymentWithIdOnly = await prisma.rentPayment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RentPaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, RentPaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RentPayment.
     * @param {RentPaymentDeleteArgs} args - Arguments to delete one RentPayment.
     * @example
     * // Delete one RentPayment
     * const RentPayment = await prisma.rentPayment.delete({
     *   where: {
     *     // ... filter to delete one RentPayment
     *   }
     * })
     * 
     */
    delete<T extends RentPaymentDeleteArgs>(args: SelectSubset<T, RentPaymentDeleteArgs<ExtArgs>>): Prisma__RentPaymentClient<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RentPayment.
     * @param {RentPaymentUpdateArgs} args - Arguments to update one RentPayment.
     * @example
     * // Update one RentPayment
     * const rentPayment = await prisma.rentPayment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RentPaymentUpdateArgs>(args: SelectSubset<T, RentPaymentUpdateArgs<ExtArgs>>): Prisma__RentPaymentClient<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RentPayments.
     * @param {RentPaymentDeleteManyArgs} args - Arguments to filter RentPayments to delete.
     * @example
     * // Delete a few RentPayments
     * const { count } = await prisma.rentPayment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RentPaymentDeleteManyArgs>(args?: SelectSubset<T, RentPaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RentPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RentPaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RentPayments
     * const rentPayment = await prisma.rentPayment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RentPaymentUpdateManyArgs>(args: SelectSubset<T, RentPaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RentPayments and returns the data updated in the database.
     * @param {RentPaymentUpdateManyAndReturnArgs} args - Arguments to update many RentPayments.
     * @example
     * // Update many RentPayments
     * const rentPayment = await prisma.rentPayment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RentPayments and only return the `id`
     * const rentPaymentWithIdOnly = await prisma.rentPayment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RentPaymentUpdateManyAndReturnArgs>(args: SelectSubset<T, RentPaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RentPayment.
     * @param {RentPaymentUpsertArgs} args - Arguments to update or create a RentPayment.
     * @example
     * // Update or create a RentPayment
     * const rentPayment = await prisma.rentPayment.upsert({
     *   create: {
     *     // ... data to create a RentPayment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RentPayment we want to update
     *   }
     * })
     */
    upsert<T extends RentPaymentUpsertArgs>(args: SelectSubset<T, RentPaymentUpsertArgs<ExtArgs>>): Prisma__RentPaymentClient<$Result.GetResult<Prisma.$RentPaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RentPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RentPaymentCountArgs} args - Arguments to filter RentPayments to count.
     * @example
     * // Count the number of RentPayments
     * const count = await prisma.rentPayment.count({
     *   where: {
     *     // ... the filter for the RentPayments we want to count
     *   }
     * })
    **/
    count<T extends RentPaymentCountArgs>(
      args?: Subset<T, RentPaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RentPaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RentPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RentPaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RentPaymentAggregateArgs>(args: Subset<T, RentPaymentAggregateArgs>): Prisma.PrismaPromise<GetRentPaymentAggregateType<T>>

    /**
     * Group by RentPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RentPaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RentPaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RentPaymentGroupByArgs['orderBy'] }
        : { orderBy?: RentPaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RentPaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRentPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RentPayment model
   */
  readonly fields: RentPaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RentPayment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RentPaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    unit<T extends UnitDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UnitDefaultArgs<ExtArgs>>): Prisma__UnitClient<$Result.GetResult<Prisma.$UnitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RentPayment model
   */
  interface RentPaymentFieldRefs {
    readonly id: FieldRef<"RentPayment", 'Int'>
    readonly tenantId: FieldRef<"RentPayment", 'Int'>
    readonly unitId: FieldRef<"RentPayment", 'Int'>
    readonly amount: FieldRef<"RentPayment", 'Float'>
    readonly dueDate: FieldRef<"RentPayment", 'DateTime'>
    readonly status: FieldRef<"RentPayment", 'PaymentStatus'>
    readonly penalty: FieldRef<"RentPayment", 'Float'>
    readonly paidAt: FieldRef<"RentPayment", 'DateTime'>
    readonly createdAt: FieldRef<"RentPayment", 'DateTime'>
    readonly updatedAt: FieldRef<"RentPayment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RentPayment findUnique
   */
  export type RentPaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * Filter, which RentPayment to fetch.
     */
    where: RentPaymentWhereUniqueInput
  }

  /**
   * RentPayment findUniqueOrThrow
   */
  export type RentPaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * Filter, which RentPayment to fetch.
     */
    where: RentPaymentWhereUniqueInput
  }

  /**
   * RentPayment findFirst
   */
  export type RentPaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * Filter, which RentPayment to fetch.
     */
    where?: RentPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RentPayments to fetch.
     */
    orderBy?: RentPaymentOrderByWithRelationInput | RentPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RentPayments.
     */
    cursor?: RentPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RentPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RentPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RentPayments.
     */
    distinct?: RentPaymentScalarFieldEnum | RentPaymentScalarFieldEnum[]
  }

  /**
   * RentPayment findFirstOrThrow
   */
  export type RentPaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * Filter, which RentPayment to fetch.
     */
    where?: RentPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RentPayments to fetch.
     */
    orderBy?: RentPaymentOrderByWithRelationInput | RentPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RentPayments.
     */
    cursor?: RentPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RentPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RentPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RentPayments.
     */
    distinct?: RentPaymentScalarFieldEnum | RentPaymentScalarFieldEnum[]
  }

  /**
   * RentPayment findMany
   */
  export type RentPaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * Filter, which RentPayments to fetch.
     */
    where?: RentPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RentPayments to fetch.
     */
    orderBy?: RentPaymentOrderByWithRelationInput | RentPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RentPayments.
     */
    cursor?: RentPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RentPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RentPayments.
     */
    skip?: number
    distinct?: RentPaymentScalarFieldEnum | RentPaymentScalarFieldEnum[]
  }

  /**
   * RentPayment create
   */
  export type RentPaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * The data needed to create a RentPayment.
     */
    data: XOR<RentPaymentCreateInput, RentPaymentUncheckedCreateInput>
  }

  /**
   * RentPayment createMany
   */
  export type RentPaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RentPayments.
     */
    data: RentPaymentCreateManyInput | RentPaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RentPayment createManyAndReturn
   */
  export type RentPaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * The data used to create many RentPayments.
     */
    data: RentPaymentCreateManyInput | RentPaymentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RentPayment update
   */
  export type RentPaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * The data needed to update a RentPayment.
     */
    data: XOR<RentPaymentUpdateInput, RentPaymentUncheckedUpdateInput>
    /**
     * Choose, which RentPayment to update.
     */
    where: RentPaymentWhereUniqueInput
  }

  /**
   * RentPayment updateMany
   */
  export type RentPaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RentPayments.
     */
    data: XOR<RentPaymentUpdateManyMutationInput, RentPaymentUncheckedUpdateManyInput>
    /**
     * Filter which RentPayments to update
     */
    where?: RentPaymentWhereInput
    /**
     * Limit how many RentPayments to update.
     */
    limit?: number
  }

  /**
   * RentPayment updateManyAndReturn
   */
  export type RentPaymentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * The data used to update RentPayments.
     */
    data: XOR<RentPaymentUpdateManyMutationInput, RentPaymentUncheckedUpdateManyInput>
    /**
     * Filter which RentPayments to update
     */
    where?: RentPaymentWhereInput
    /**
     * Limit how many RentPayments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RentPayment upsert
   */
  export type RentPaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * The filter to search for the RentPayment to update in case it exists.
     */
    where: RentPaymentWhereUniqueInput
    /**
     * In case the RentPayment found by the `where` argument doesn't exist, create a new RentPayment with this data.
     */
    create: XOR<RentPaymentCreateInput, RentPaymentUncheckedCreateInput>
    /**
     * In case the RentPayment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RentPaymentUpdateInput, RentPaymentUncheckedUpdateInput>
  }

  /**
   * RentPayment delete
   */
  export type RentPaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
    /**
     * Filter which RentPayment to delete.
     */
    where: RentPaymentWhereUniqueInput
  }

  /**
   * RentPayment deleteMany
   */
  export type RentPaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RentPayments to delete
     */
    where?: RentPaymentWhereInput
    /**
     * Limit how many RentPayments to delete.
     */
    limit?: number
  }

  /**
   * RentPayment without action
   */
  export type RentPaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RentPayment
     */
    select?: RentPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RentPayment
     */
    omit?: RentPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RentPaymentInclude<ExtArgs> | null
  }


  /**
   * Model WaterBill
   */

  export type AggregateWaterBill = {
    _count: WaterBillCountAggregateOutputType | null
    _avg: WaterBillAvgAggregateOutputType | null
    _sum: WaterBillSumAggregateOutputType | null
    _min: WaterBillMinAggregateOutputType | null
    _max: WaterBillMaxAggregateOutputType | null
  }

  export type WaterBillAvgAggregateOutputType = {
    id: number | null
    tenantId: number | null
    reading: number | null
    amount: number | null
  }

  export type WaterBillSumAggregateOutputType = {
    id: number | null
    tenantId: number | null
    reading: number | null
    amount: number | null
  }

  export type WaterBillMinAggregateOutputType = {
    id: number | null
    tenantId: number | null
    reading: number | null
    amount: number | null
    status: $Enums.PaymentStatus | null
    paidAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WaterBillMaxAggregateOutputType = {
    id: number | null
    tenantId: number | null
    reading: number | null
    amount: number | null
    status: $Enums.PaymentStatus | null
    paidAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WaterBillCountAggregateOutputType = {
    id: number
    tenantId: number
    reading: number
    amount: number
    status: number
    paidAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WaterBillAvgAggregateInputType = {
    id?: true
    tenantId?: true
    reading?: true
    amount?: true
  }

  export type WaterBillSumAggregateInputType = {
    id?: true
    tenantId?: true
    reading?: true
    amount?: true
  }

  export type WaterBillMinAggregateInputType = {
    id?: true
    tenantId?: true
    reading?: true
    amount?: true
    status?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WaterBillMaxAggregateInputType = {
    id?: true
    tenantId?: true
    reading?: true
    amount?: true
    status?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WaterBillCountAggregateInputType = {
    id?: true
    tenantId?: true
    reading?: true
    amount?: true
    status?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WaterBillAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WaterBill to aggregate.
     */
    where?: WaterBillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterBills to fetch.
     */
    orderBy?: WaterBillOrderByWithRelationInput | WaterBillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WaterBillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterBills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterBills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WaterBills
    **/
    _count?: true | WaterBillCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WaterBillAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WaterBillSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WaterBillMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WaterBillMaxAggregateInputType
  }

  export type GetWaterBillAggregateType<T extends WaterBillAggregateArgs> = {
        [P in keyof T & keyof AggregateWaterBill]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWaterBill[P]>
      : GetScalarType<T[P], AggregateWaterBill[P]>
  }




  export type WaterBillGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WaterBillWhereInput
    orderBy?: WaterBillOrderByWithAggregationInput | WaterBillOrderByWithAggregationInput[]
    by: WaterBillScalarFieldEnum[] | WaterBillScalarFieldEnum
    having?: WaterBillScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WaterBillCountAggregateInputType | true
    _avg?: WaterBillAvgAggregateInputType
    _sum?: WaterBillSumAggregateInputType
    _min?: WaterBillMinAggregateInputType
    _max?: WaterBillMaxAggregateInputType
  }

  export type WaterBillGroupByOutputType = {
    id: number
    tenantId: number
    reading: number
    amount: number
    status: $Enums.PaymentStatus
    paidAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: WaterBillCountAggregateOutputType | null
    _avg: WaterBillAvgAggregateOutputType | null
    _sum: WaterBillSumAggregateOutputType | null
    _min: WaterBillMinAggregateOutputType | null
    _max: WaterBillMaxAggregateOutputType | null
  }

  type GetWaterBillGroupByPayload<T extends WaterBillGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WaterBillGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WaterBillGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WaterBillGroupByOutputType[P]>
            : GetScalarType<T[P], WaterBillGroupByOutputType[P]>
        }
      >
    >


  export type WaterBillSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    reading?: boolean
    amount?: boolean
    status?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["waterBill"]>

  export type WaterBillSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    reading?: boolean
    amount?: boolean
    status?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["waterBill"]>

  export type WaterBillSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    reading?: boolean
    amount?: boolean
    status?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["waterBill"]>

  export type WaterBillSelectScalar = {
    id?: boolean
    tenantId?: boolean
    reading?: boolean
    amount?: boolean
    status?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WaterBillOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "reading" | "amount" | "status" | "paidAt" | "createdAt" | "updatedAt", ExtArgs["result"]["waterBill"]>
  export type WaterBillInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WaterBillIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WaterBillIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $WaterBillPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WaterBill"
    objects: {
      tenant: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      tenantId: number
      reading: number
      amount: number
      status: $Enums.PaymentStatus
      paidAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["waterBill"]>
    composites: {}
  }

  type WaterBillGetPayload<S extends boolean | null | undefined | WaterBillDefaultArgs> = $Result.GetResult<Prisma.$WaterBillPayload, S>

  type WaterBillCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WaterBillFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WaterBillCountAggregateInputType | true
    }

  export interface WaterBillDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WaterBill'], meta: { name: 'WaterBill' } }
    /**
     * Find zero or one WaterBill that matches the filter.
     * @param {WaterBillFindUniqueArgs} args - Arguments to find a WaterBill
     * @example
     * // Get one WaterBill
     * const waterBill = await prisma.waterBill.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WaterBillFindUniqueArgs>(args: SelectSubset<T, WaterBillFindUniqueArgs<ExtArgs>>): Prisma__WaterBillClient<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WaterBill that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WaterBillFindUniqueOrThrowArgs} args - Arguments to find a WaterBill
     * @example
     * // Get one WaterBill
     * const waterBill = await prisma.waterBill.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WaterBillFindUniqueOrThrowArgs>(args: SelectSubset<T, WaterBillFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WaterBillClient<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WaterBill that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterBillFindFirstArgs} args - Arguments to find a WaterBill
     * @example
     * // Get one WaterBill
     * const waterBill = await prisma.waterBill.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WaterBillFindFirstArgs>(args?: SelectSubset<T, WaterBillFindFirstArgs<ExtArgs>>): Prisma__WaterBillClient<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WaterBill that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterBillFindFirstOrThrowArgs} args - Arguments to find a WaterBill
     * @example
     * // Get one WaterBill
     * const waterBill = await prisma.waterBill.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WaterBillFindFirstOrThrowArgs>(args?: SelectSubset<T, WaterBillFindFirstOrThrowArgs<ExtArgs>>): Prisma__WaterBillClient<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WaterBills that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterBillFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WaterBills
     * const waterBills = await prisma.waterBill.findMany()
     * 
     * // Get first 10 WaterBills
     * const waterBills = await prisma.waterBill.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const waterBillWithIdOnly = await prisma.waterBill.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WaterBillFindManyArgs>(args?: SelectSubset<T, WaterBillFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WaterBill.
     * @param {WaterBillCreateArgs} args - Arguments to create a WaterBill.
     * @example
     * // Create one WaterBill
     * const WaterBill = await prisma.waterBill.create({
     *   data: {
     *     // ... data to create a WaterBill
     *   }
     * })
     * 
     */
    create<T extends WaterBillCreateArgs>(args: SelectSubset<T, WaterBillCreateArgs<ExtArgs>>): Prisma__WaterBillClient<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WaterBills.
     * @param {WaterBillCreateManyArgs} args - Arguments to create many WaterBills.
     * @example
     * // Create many WaterBills
     * const waterBill = await prisma.waterBill.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WaterBillCreateManyArgs>(args?: SelectSubset<T, WaterBillCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WaterBills and returns the data saved in the database.
     * @param {WaterBillCreateManyAndReturnArgs} args - Arguments to create many WaterBills.
     * @example
     * // Create many WaterBills
     * const waterBill = await prisma.waterBill.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WaterBills and only return the `id`
     * const waterBillWithIdOnly = await prisma.waterBill.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WaterBillCreateManyAndReturnArgs>(args?: SelectSubset<T, WaterBillCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WaterBill.
     * @param {WaterBillDeleteArgs} args - Arguments to delete one WaterBill.
     * @example
     * // Delete one WaterBill
     * const WaterBill = await prisma.waterBill.delete({
     *   where: {
     *     // ... filter to delete one WaterBill
     *   }
     * })
     * 
     */
    delete<T extends WaterBillDeleteArgs>(args: SelectSubset<T, WaterBillDeleteArgs<ExtArgs>>): Prisma__WaterBillClient<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WaterBill.
     * @param {WaterBillUpdateArgs} args - Arguments to update one WaterBill.
     * @example
     * // Update one WaterBill
     * const waterBill = await prisma.waterBill.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WaterBillUpdateArgs>(args: SelectSubset<T, WaterBillUpdateArgs<ExtArgs>>): Prisma__WaterBillClient<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WaterBills.
     * @param {WaterBillDeleteManyArgs} args - Arguments to filter WaterBills to delete.
     * @example
     * // Delete a few WaterBills
     * const { count } = await prisma.waterBill.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WaterBillDeleteManyArgs>(args?: SelectSubset<T, WaterBillDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WaterBills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterBillUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WaterBills
     * const waterBill = await prisma.waterBill.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WaterBillUpdateManyArgs>(args: SelectSubset<T, WaterBillUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WaterBills and returns the data updated in the database.
     * @param {WaterBillUpdateManyAndReturnArgs} args - Arguments to update many WaterBills.
     * @example
     * // Update many WaterBills
     * const waterBill = await prisma.waterBill.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WaterBills and only return the `id`
     * const waterBillWithIdOnly = await prisma.waterBill.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WaterBillUpdateManyAndReturnArgs>(args: SelectSubset<T, WaterBillUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WaterBill.
     * @param {WaterBillUpsertArgs} args - Arguments to update or create a WaterBill.
     * @example
     * // Update or create a WaterBill
     * const waterBill = await prisma.waterBill.upsert({
     *   create: {
     *     // ... data to create a WaterBill
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WaterBill we want to update
     *   }
     * })
     */
    upsert<T extends WaterBillUpsertArgs>(args: SelectSubset<T, WaterBillUpsertArgs<ExtArgs>>): Prisma__WaterBillClient<$Result.GetResult<Prisma.$WaterBillPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WaterBills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterBillCountArgs} args - Arguments to filter WaterBills to count.
     * @example
     * // Count the number of WaterBills
     * const count = await prisma.waterBill.count({
     *   where: {
     *     // ... the filter for the WaterBills we want to count
     *   }
     * })
    **/
    count<T extends WaterBillCountArgs>(
      args?: Subset<T, WaterBillCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WaterBillCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WaterBill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterBillAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WaterBillAggregateArgs>(args: Subset<T, WaterBillAggregateArgs>): Prisma.PrismaPromise<GetWaterBillAggregateType<T>>

    /**
     * Group by WaterBill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterBillGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WaterBillGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WaterBillGroupByArgs['orderBy'] }
        : { orderBy?: WaterBillGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WaterBillGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWaterBillGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WaterBill model
   */
  readonly fields: WaterBillFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WaterBill.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WaterBillClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WaterBill model
   */
  interface WaterBillFieldRefs {
    readonly id: FieldRef<"WaterBill", 'Int'>
    readonly tenantId: FieldRef<"WaterBill", 'Int'>
    readonly reading: FieldRef<"WaterBill", 'Float'>
    readonly amount: FieldRef<"WaterBill", 'Float'>
    readonly status: FieldRef<"WaterBill", 'PaymentStatus'>
    readonly paidAt: FieldRef<"WaterBill", 'DateTime'>
    readonly createdAt: FieldRef<"WaterBill", 'DateTime'>
    readonly updatedAt: FieldRef<"WaterBill", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WaterBill findUnique
   */
  export type WaterBillFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * Filter, which WaterBill to fetch.
     */
    where: WaterBillWhereUniqueInput
  }

  /**
   * WaterBill findUniqueOrThrow
   */
  export type WaterBillFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * Filter, which WaterBill to fetch.
     */
    where: WaterBillWhereUniqueInput
  }

  /**
   * WaterBill findFirst
   */
  export type WaterBillFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * Filter, which WaterBill to fetch.
     */
    where?: WaterBillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterBills to fetch.
     */
    orderBy?: WaterBillOrderByWithRelationInput | WaterBillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WaterBills.
     */
    cursor?: WaterBillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterBills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterBills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WaterBills.
     */
    distinct?: WaterBillScalarFieldEnum | WaterBillScalarFieldEnum[]
  }

  /**
   * WaterBill findFirstOrThrow
   */
  export type WaterBillFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * Filter, which WaterBill to fetch.
     */
    where?: WaterBillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterBills to fetch.
     */
    orderBy?: WaterBillOrderByWithRelationInput | WaterBillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WaterBills.
     */
    cursor?: WaterBillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterBills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterBills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WaterBills.
     */
    distinct?: WaterBillScalarFieldEnum | WaterBillScalarFieldEnum[]
  }

  /**
   * WaterBill findMany
   */
  export type WaterBillFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * Filter, which WaterBills to fetch.
     */
    where?: WaterBillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterBills to fetch.
     */
    orderBy?: WaterBillOrderByWithRelationInput | WaterBillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WaterBills.
     */
    cursor?: WaterBillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterBills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterBills.
     */
    skip?: number
    distinct?: WaterBillScalarFieldEnum | WaterBillScalarFieldEnum[]
  }

  /**
   * WaterBill create
   */
  export type WaterBillCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * The data needed to create a WaterBill.
     */
    data: XOR<WaterBillCreateInput, WaterBillUncheckedCreateInput>
  }

  /**
   * WaterBill createMany
   */
  export type WaterBillCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WaterBills.
     */
    data: WaterBillCreateManyInput | WaterBillCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WaterBill createManyAndReturn
   */
  export type WaterBillCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * The data used to create many WaterBills.
     */
    data: WaterBillCreateManyInput | WaterBillCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WaterBill update
   */
  export type WaterBillUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * The data needed to update a WaterBill.
     */
    data: XOR<WaterBillUpdateInput, WaterBillUncheckedUpdateInput>
    /**
     * Choose, which WaterBill to update.
     */
    where: WaterBillWhereUniqueInput
  }

  /**
   * WaterBill updateMany
   */
  export type WaterBillUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WaterBills.
     */
    data: XOR<WaterBillUpdateManyMutationInput, WaterBillUncheckedUpdateManyInput>
    /**
     * Filter which WaterBills to update
     */
    where?: WaterBillWhereInput
    /**
     * Limit how many WaterBills to update.
     */
    limit?: number
  }

  /**
   * WaterBill updateManyAndReturn
   */
  export type WaterBillUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * The data used to update WaterBills.
     */
    data: XOR<WaterBillUpdateManyMutationInput, WaterBillUncheckedUpdateManyInput>
    /**
     * Filter which WaterBills to update
     */
    where?: WaterBillWhereInput
    /**
     * Limit how many WaterBills to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WaterBill upsert
   */
  export type WaterBillUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * The filter to search for the WaterBill to update in case it exists.
     */
    where: WaterBillWhereUniqueInput
    /**
     * In case the WaterBill found by the `where` argument doesn't exist, create a new WaterBill with this data.
     */
    create: XOR<WaterBillCreateInput, WaterBillUncheckedCreateInput>
    /**
     * In case the WaterBill was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WaterBillUpdateInput, WaterBillUncheckedUpdateInput>
  }

  /**
   * WaterBill delete
   */
  export type WaterBillDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
    /**
     * Filter which WaterBill to delete.
     */
    where: WaterBillWhereUniqueInput
  }

  /**
   * WaterBill deleteMany
   */
  export type WaterBillDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WaterBills to delete
     */
    where?: WaterBillWhereInput
    /**
     * Limit how many WaterBills to delete.
     */
    limit?: number
  }

  /**
   * WaterBill without action
   */
  export type WaterBillDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterBill
     */
    select?: WaterBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterBill
     */
    omit?: WaterBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterBillInclude<ExtArgs> | null
  }


  /**
   * Model ElectricityBill
   */

  export type AggregateElectricityBill = {
    _count: ElectricityBillCountAggregateOutputType | null
    _avg: ElectricityBillAvgAggregateOutputType | null
    _sum: ElectricityBillSumAggregateOutputType | null
    _min: ElectricityBillMinAggregateOutputType | null
    _max: ElectricityBillMaxAggregateOutputType | null
  }

  export type ElectricityBillAvgAggregateOutputType = {
    id: number | null
    tenantId: number | null
    tokens: number | null
    amount: number | null
  }

  export type ElectricityBillSumAggregateOutputType = {
    id: number | null
    tenantId: number | null
    tokens: number | null
    amount: number | null
  }

  export type ElectricityBillMinAggregateOutputType = {
    id: number | null
    tenantId: number | null
    tokens: number | null
    amount: number | null
    status: $Enums.PaymentStatus | null
    paidAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ElectricityBillMaxAggregateOutputType = {
    id: number | null
    tenantId: number | null
    tokens: number | null
    amount: number | null
    status: $Enums.PaymentStatus | null
    paidAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ElectricityBillCountAggregateOutputType = {
    id: number
    tenantId: number
    tokens: number
    amount: number
    status: number
    paidAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ElectricityBillAvgAggregateInputType = {
    id?: true
    tenantId?: true
    tokens?: true
    amount?: true
  }

  export type ElectricityBillSumAggregateInputType = {
    id?: true
    tenantId?: true
    tokens?: true
    amount?: true
  }

  export type ElectricityBillMinAggregateInputType = {
    id?: true
    tenantId?: true
    tokens?: true
    amount?: true
    status?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ElectricityBillMaxAggregateInputType = {
    id?: true
    tenantId?: true
    tokens?: true
    amount?: true
    status?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ElectricityBillCountAggregateInputType = {
    id?: true
    tenantId?: true
    tokens?: true
    amount?: true
    status?: true
    paidAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ElectricityBillAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ElectricityBill to aggregate.
     */
    where?: ElectricityBillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElectricityBills to fetch.
     */
    orderBy?: ElectricityBillOrderByWithRelationInput | ElectricityBillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ElectricityBillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElectricityBills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElectricityBills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ElectricityBills
    **/
    _count?: true | ElectricityBillCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ElectricityBillAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ElectricityBillSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ElectricityBillMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ElectricityBillMaxAggregateInputType
  }

  export type GetElectricityBillAggregateType<T extends ElectricityBillAggregateArgs> = {
        [P in keyof T & keyof AggregateElectricityBill]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateElectricityBill[P]>
      : GetScalarType<T[P], AggregateElectricityBill[P]>
  }




  export type ElectricityBillGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ElectricityBillWhereInput
    orderBy?: ElectricityBillOrderByWithAggregationInput | ElectricityBillOrderByWithAggregationInput[]
    by: ElectricityBillScalarFieldEnum[] | ElectricityBillScalarFieldEnum
    having?: ElectricityBillScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ElectricityBillCountAggregateInputType | true
    _avg?: ElectricityBillAvgAggregateInputType
    _sum?: ElectricityBillSumAggregateInputType
    _min?: ElectricityBillMinAggregateInputType
    _max?: ElectricityBillMaxAggregateInputType
  }

  export type ElectricityBillGroupByOutputType = {
    id: number
    tenantId: number
    tokens: number
    amount: number
    status: $Enums.PaymentStatus
    paidAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ElectricityBillCountAggregateOutputType | null
    _avg: ElectricityBillAvgAggregateOutputType | null
    _sum: ElectricityBillSumAggregateOutputType | null
    _min: ElectricityBillMinAggregateOutputType | null
    _max: ElectricityBillMaxAggregateOutputType | null
  }

  type GetElectricityBillGroupByPayload<T extends ElectricityBillGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ElectricityBillGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ElectricityBillGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ElectricityBillGroupByOutputType[P]>
            : GetScalarType<T[P], ElectricityBillGroupByOutputType[P]>
        }
      >
    >


  export type ElectricityBillSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    tokens?: boolean
    amount?: boolean
    status?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["electricityBill"]>

  export type ElectricityBillSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    tokens?: boolean
    amount?: boolean
    status?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["electricityBill"]>

  export type ElectricityBillSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    tokens?: boolean
    amount?: boolean
    status?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["electricityBill"]>

  export type ElectricityBillSelectScalar = {
    id?: boolean
    tenantId?: boolean
    tokens?: boolean
    amount?: boolean
    status?: boolean
    paidAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ElectricityBillOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "tokens" | "amount" | "status" | "paidAt" | "createdAt" | "updatedAt", ExtArgs["result"]["electricityBill"]>
  export type ElectricityBillInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ElectricityBillIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ElectricityBillIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ElectricityBillPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ElectricityBill"
    objects: {
      tenant: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      tenantId: number
      tokens: number
      amount: number
      status: $Enums.PaymentStatus
      paidAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["electricityBill"]>
    composites: {}
  }

  type ElectricityBillGetPayload<S extends boolean | null | undefined | ElectricityBillDefaultArgs> = $Result.GetResult<Prisma.$ElectricityBillPayload, S>

  type ElectricityBillCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ElectricityBillFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ElectricityBillCountAggregateInputType | true
    }

  export interface ElectricityBillDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ElectricityBill'], meta: { name: 'ElectricityBill' } }
    /**
     * Find zero or one ElectricityBill that matches the filter.
     * @param {ElectricityBillFindUniqueArgs} args - Arguments to find a ElectricityBill
     * @example
     * // Get one ElectricityBill
     * const electricityBill = await prisma.electricityBill.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ElectricityBillFindUniqueArgs>(args: SelectSubset<T, ElectricityBillFindUniqueArgs<ExtArgs>>): Prisma__ElectricityBillClient<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ElectricityBill that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ElectricityBillFindUniqueOrThrowArgs} args - Arguments to find a ElectricityBill
     * @example
     * // Get one ElectricityBill
     * const electricityBill = await prisma.electricityBill.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ElectricityBillFindUniqueOrThrowArgs>(args: SelectSubset<T, ElectricityBillFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ElectricityBillClient<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ElectricityBill that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElectricityBillFindFirstArgs} args - Arguments to find a ElectricityBill
     * @example
     * // Get one ElectricityBill
     * const electricityBill = await prisma.electricityBill.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ElectricityBillFindFirstArgs>(args?: SelectSubset<T, ElectricityBillFindFirstArgs<ExtArgs>>): Prisma__ElectricityBillClient<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ElectricityBill that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElectricityBillFindFirstOrThrowArgs} args - Arguments to find a ElectricityBill
     * @example
     * // Get one ElectricityBill
     * const electricityBill = await prisma.electricityBill.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ElectricityBillFindFirstOrThrowArgs>(args?: SelectSubset<T, ElectricityBillFindFirstOrThrowArgs<ExtArgs>>): Prisma__ElectricityBillClient<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ElectricityBills that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElectricityBillFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ElectricityBills
     * const electricityBills = await prisma.electricityBill.findMany()
     * 
     * // Get first 10 ElectricityBills
     * const electricityBills = await prisma.electricityBill.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const electricityBillWithIdOnly = await prisma.electricityBill.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ElectricityBillFindManyArgs>(args?: SelectSubset<T, ElectricityBillFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ElectricityBill.
     * @param {ElectricityBillCreateArgs} args - Arguments to create a ElectricityBill.
     * @example
     * // Create one ElectricityBill
     * const ElectricityBill = await prisma.electricityBill.create({
     *   data: {
     *     // ... data to create a ElectricityBill
     *   }
     * })
     * 
     */
    create<T extends ElectricityBillCreateArgs>(args: SelectSubset<T, ElectricityBillCreateArgs<ExtArgs>>): Prisma__ElectricityBillClient<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ElectricityBills.
     * @param {ElectricityBillCreateManyArgs} args - Arguments to create many ElectricityBills.
     * @example
     * // Create many ElectricityBills
     * const electricityBill = await prisma.electricityBill.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ElectricityBillCreateManyArgs>(args?: SelectSubset<T, ElectricityBillCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ElectricityBills and returns the data saved in the database.
     * @param {ElectricityBillCreateManyAndReturnArgs} args - Arguments to create many ElectricityBills.
     * @example
     * // Create many ElectricityBills
     * const electricityBill = await prisma.electricityBill.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ElectricityBills and only return the `id`
     * const electricityBillWithIdOnly = await prisma.electricityBill.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ElectricityBillCreateManyAndReturnArgs>(args?: SelectSubset<T, ElectricityBillCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ElectricityBill.
     * @param {ElectricityBillDeleteArgs} args - Arguments to delete one ElectricityBill.
     * @example
     * // Delete one ElectricityBill
     * const ElectricityBill = await prisma.electricityBill.delete({
     *   where: {
     *     // ... filter to delete one ElectricityBill
     *   }
     * })
     * 
     */
    delete<T extends ElectricityBillDeleteArgs>(args: SelectSubset<T, ElectricityBillDeleteArgs<ExtArgs>>): Prisma__ElectricityBillClient<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ElectricityBill.
     * @param {ElectricityBillUpdateArgs} args - Arguments to update one ElectricityBill.
     * @example
     * // Update one ElectricityBill
     * const electricityBill = await prisma.electricityBill.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ElectricityBillUpdateArgs>(args: SelectSubset<T, ElectricityBillUpdateArgs<ExtArgs>>): Prisma__ElectricityBillClient<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ElectricityBills.
     * @param {ElectricityBillDeleteManyArgs} args - Arguments to filter ElectricityBills to delete.
     * @example
     * // Delete a few ElectricityBills
     * const { count } = await prisma.electricityBill.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ElectricityBillDeleteManyArgs>(args?: SelectSubset<T, ElectricityBillDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ElectricityBills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElectricityBillUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ElectricityBills
     * const electricityBill = await prisma.electricityBill.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ElectricityBillUpdateManyArgs>(args: SelectSubset<T, ElectricityBillUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ElectricityBills and returns the data updated in the database.
     * @param {ElectricityBillUpdateManyAndReturnArgs} args - Arguments to update many ElectricityBills.
     * @example
     * // Update many ElectricityBills
     * const electricityBill = await prisma.electricityBill.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ElectricityBills and only return the `id`
     * const electricityBillWithIdOnly = await prisma.electricityBill.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ElectricityBillUpdateManyAndReturnArgs>(args: SelectSubset<T, ElectricityBillUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ElectricityBill.
     * @param {ElectricityBillUpsertArgs} args - Arguments to update or create a ElectricityBill.
     * @example
     * // Update or create a ElectricityBill
     * const electricityBill = await prisma.electricityBill.upsert({
     *   create: {
     *     // ... data to create a ElectricityBill
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ElectricityBill we want to update
     *   }
     * })
     */
    upsert<T extends ElectricityBillUpsertArgs>(args: SelectSubset<T, ElectricityBillUpsertArgs<ExtArgs>>): Prisma__ElectricityBillClient<$Result.GetResult<Prisma.$ElectricityBillPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ElectricityBills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElectricityBillCountArgs} args - Arguments to filter ElectricityBills to count.
     * @example
     * // Count the number of ElectricityBills
     * const count = await prisma.electricityBill.count({
     *   where: {
     *     // ... the filter for the ElectricityBills we want to count
     *   }
     * })
    **/
    count<T extends ElectricityBillCountArgs>(
      args?: Subset<T, ElectricityBillCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ElectricityBillCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ElectricityBill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElectricityBillAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ElectricityBillAggregateArgs>(args: Subset<T, ElectricityBillAggregateArgs>): Prisma.PrismaPromise<GetElectricityBillAggregateType<T>>

    /**
     * Group by ElectricityBill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElectricityBillGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ElectricityBillGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ElectricityBillGroupByArgs['orderBy'] }
        : { orderBy?: ElectricityBillGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ElectricityBillGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetElectricityBillGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ElectricityBill model
   */
  readonly fields: ElectricityBillFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ElectricityBill.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ElectricityBillClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ElectricityBill model
   */
  interface ElectricityBillFieldRefs {
    readonly id: FieldRef<"ElectricityBill", 'Int'>
    readonly tenantId: FieldRef<"ElectricityBill", 'Int'>
    readonly tokens: FieldRef<"ElectricityBill", 'Int'>
    readonly amount: FieldRef<"ElectricityBill", 'Float'>
    readonly status: FieldRef<"ElectricityBill", 'PaymentStatus'>
    readonly paidAt: FieldRef<"ElectricityBill", 'DateTime'>
    readonly createdAt: FieldRef<"ElectricityBill", 'DateTime'>
    readonly updatedAt: FieldRef<"ElectricityBill", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ElectricityBill findUnique
   */
  export type ElectricityBillFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * Filter, which ElectricityBill to fetch.
     */
    where: ElectricityBillWhereUniqueInput
  }

  /**
   * ElectricityBill findUniqueOrThrow
   */
  export type ElectricityBillFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * Filter, which ElectricityBill to fetch.
     */
    where: ElectricityBillWhereUniqueInput
  }

  /**
   * ElectricityBill findFirst
   */
  export type ElectricityBillFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * Filter, which ElectricityBill to fetch.
     */
    where?: ElectricityBillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElectricityBills to fetch.
     */
    orderBy?: ElectricityBillOrderByWithRelationInput | ElectricityBillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ElectricityBills.
     */
    cursor?: ElectricityBillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElectricityBills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElectricityBills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ElectricityBills.
     */
    distinct?: ElectricityBillScalarFieldEnum | ElectricityBillScalarFieldEnum[]
  }

  /**
   * ElectricityBill findFirstOrThrow
   */
  export type ElectricityBillFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * Filter, which ElectricityBill to fetch.
     */
    where?: ElectricityBillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElectricityBills to fetch.
     */
    orderBy?: ElectricityBillOrderByWithRelationInput | ElectricityBillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ElectricityBills.
     */
    cursor?: ElectricityBillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElectricityBills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElectricityBills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ElectricityBills.
     */
    distinct?: ElectricityBillScalarFieldEnum | ElectricityBillScalarFieldEnum[]
  }

  /**
   * ElectricityBill findMany
   */
  export type ElectricityBillFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * Filter, which ElectricityBills to fetch.
     */
    where?: ElectricityBillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElectricityBills to fetch.
     */
    orderBy?: ElectricityBillOrderByWithRelationInput | ElectricityBillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ElectricityBills.
     */
    cursor?: ElectricityBillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElectricityBills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElectricityBills.
     */
    skip?: number
    distinct?: ElectricityBillScalarFieldEnum | ElectricityBillScalarFieldEnum[]
  }

  /**
   * ElectricityBill create
   */
  export type ElectricityBillCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * The data needed to create a ElectricityBill.
     */
    data: XOR<ElectricityBillCreateInput, ElectricityBillUncheckedCreateInput>
  }

  /**
   * ElectricityBill createMany
   */
  export type ElectricityBillCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ElectricityBills.
     */
    data: ElectricityBillCreateManyInput | ElectricityBillCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ElectricityBill createManyAndReturn
   */
  export type ElectricityBillCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * The data used to create many ElectricityBills.
     */
    data: ElectricityBillCreateManyInput | ElectricityBillCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ElectricityBill update
   */
  export type ElectricityBillUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * The data needed to update a ElectricityBill.
     */
    data: XOR<ElectricityBillUpdateInput, ElectricityBillUncheckedUpdateInput>
    /**
     * Choose, which ElectricityBill to update.
     */
    where: ElectricityBillWhereUniqueInput
  }

  /**
   * ElectricityBill updateMany
   */
  export type ElectricityBillUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ElectricityBills.
     */
    data: XOR<ElectricityBillUpdateManyMutationInput, ElectricityBillUncheckedUpdateManyInput>
    /**
     * Filter which ElectricityBills to update
     */
    where?: ElectricityBillWhereInput
    /**
     * Limit how many ElectricityBills to update.
     */
    limit?: number
  }

  /**
   * ElectricityBill updateManyAndReturn
   */
  export type ElectricityBillUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * The data used to update ElectricityBills.
     */
    data: XOR<ElectricityBillUpdateManyMutationInput, ElectricityBillUncheckedUpdateManyInput>
    /**
     * Filter which ElectricityBills to update
     */
    where?: ElectricityBillWhereInput
    /**
     * Limit how many ElectricityBills to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ElectricityBill upsert
   */
  export type ElectricityBillUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * The filter to search for the ElectricityBill to update in case it exists.
     */
    where: ElectricityBillWhereUniqueInput
    /**
     * In case the ElectricityBill found by the `where` argument doesn't exist, create a new ElectricityBill with this data.
     */
    create: XOR<ElectricityBillCreateInput, ElectricityBillUncheckedCreateInput>
    /**
     * In case the ElectricityBill was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ElectricityBillUpdateInput, ElectricityBillUncheckedUpdateInput>
  }

  /**
   * ElectricityBill delete
   */
  export type ElectricityBillDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
    /**
     * Filter which ElectricityBill to delete.
     */
    where: ElectricityBillWhereUniqueInput
  }

  /**
   * ElectricityBill deleteMany
   */
  export type ElectricityBillDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ElectricityBills to delete
     */
    where?: ElectricityBillWhereInput
    /**
     * Limit how many ElectricityBills to delete.
     */
    limit?: number
  }

  /**
   * ElectricityBill without action
   */
  export type ElectricityBillDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElectricityBill
     */
    select?: ElectricityBillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ElectricityBill
     */
    omit?: ElectricityBillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElectricityBillInclude<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _avg: NotificationAvgAggregateOutputType | null
    _sum: NotificationSumAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type NotificationSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type NotificationMinAggregateOutputType = {
    id: number | null
    userId: number | null
    title: string | null
    message: string | null
    isRead: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    title: string | null
    message: string | null
    isRead: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    userId: number
    title: number
    message: number
    isRead: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type NotificationAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type NotificationSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type NotificationMinAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NotificationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NotificationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _avg?: NotificationAvgAggregateInputType
    _sum?: NotificationSumAggregateInputType
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: number
    userId: number
    title: string
    message: string
    isRead: boolean
    createdAt: Date
    updatedAt: Date
    _count: NotificationCountAggregateOutputType | null
    _avg: NotificationAvgAggregateOutputType | null
    _sum: NotificationSumAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    userId?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "title" | "message" | "isRead" | "createdAt" | "updatedAt", ExtArgs["result"]["notification"]>
  export type NotificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type NotificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type NotificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      title: string
      message: string
      isRead: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {NotificationUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NotificationUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Notification model
   */
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'Int'>
    readonly userId: FieldRef<"Notification", 'Int'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly isRead: FieldRef<"Notification", 'Boolean'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
    readonly updatedAt: FieldRef<"Notification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification updateManyAndReturn
   */
  export type NotificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
  }


  /**
   * Model POI
   */

  export type AggregatePOI = {
    _count: POICountAggregateOutputType | null
    _avg: POIAvgAggregateOutputType | null
    _sum: POISumAggregateOutputType | null
    _min: POIMinAggregateOutputType | null
    _max: POIMaxAggregateOutputType | null
  }

  export type POIAvgAggregateOutputType = {
    id: number | null
    latitude: number | null
    longitude: number | null
    embedding: number | null
  }

  export type POISumAggregateOutputType = {
    id: number | null
    latitude: number | null
    longitude: number | null
    embedding: number[]
  }

  export type POIMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    latitude: number | null
    longitude: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type POIMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    latitude: number | null
    longitude: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type POICountAggregateOutputType = {
    id: number
    name: number
    description: number
    latitude: number
    longitude: number
    embedding: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type POIAvgAggregateInputType = {
    id?: true
    latitude?: true
    longitude?: true
    embedding?: true
  }

  export type POISumAggregateInputType = {
    id?: true
    latitude?: true
    longitude?: true
    embedding?: true
  }

  export type POIMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    latitude?: true
    longitude?: true
    createdAt?: true
    updatedAt?: true
  }

  export type POIMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    latitude?: true
    longitude?: true
    createdAt?: true
    updatedAt?: true
  }

  export type POICountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    latitude?: true
    longitude?: true
    embedding?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type POIAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which POI to aggregate.
     */
    where?: POIWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of POIS to fetch.
     */
    orderBy?: POIOrderByWithRelationInput | POIOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: POIWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` POIS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` POIS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned POIS
    **/
    _count?: true | POICountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: POIAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: POISumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: POIMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: POIMaxAggregateInputType
  }

  export type GetPOIAggregateType<T extends POIAggregateArgs> = {
        [P in keyof T & keyof AggregatePOI]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePOI[P]>
      : GetScalarType<T[P], AggregatePOI[P]>
  }




  export type POIGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: POIWhereInput
    orderBy?: POIOrderByWithAggregationInput | POIOrderByWithAggregationInput[]
    by: POIScalarFieldEnum[] | POIScalarFieldEnum
    having?: POIScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: POICountAggregateInputType | true
    _avg?: POIAvgAggregateInputType
    _sum?: POISumAggregateInputType
    _min?: POIMinAggregateInputType
    _max?: POIMaxAggregateInputType
  }

  export type POIGroupByOutputType = {
    id: number
    name: string
    description: string | null
    latitude: number
    longitude: number
    embedding: number[]
    createdAt: Date
    updatedAt: Date
    _count: POICountAggregateOutputType | null
    _avg: POIAvgAggregateOutputType | null
    _sum: POISumAggregateOutputType | null
    _min: POIMinAggregateOutputType | null
    _max: POIMaxAggregateOutputType | null
  }

  type GetPOIGroupByPayload<T extends POIGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<POIGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof POIGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], POIGroupByOutputType[P]>
            : GetScalarType<T[P], POIGroupByOutputType[P]>
        }
      >
    >


  export type POISelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    latitude?: boolean
    longitude?: boolean
    embedding?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pOI"]>

  export type POISelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    latitude?: boolean
    longitude?: boolean
    embedding?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pOI"]>

  export type POISelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    latitude?: boolean
    longitude?: boolean
    embedding?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pOI"]>

  export type POISelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    latitude?: boolean
    longitude?: boolean
    embedding?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type POIOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "latitude" | "longitude" | "embedding" | "createdAt" | "updatedAt", ExtArgs["result"]["pOI"]>

  export type $POIPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "POI"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
      latitude: number
      longitude: number
      embedding: number[]
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["pOI"]>
    composites: {}
  }

  type POIGetPayload<S extends boolean | null | undefined | POIDefaultArgs> = $Result.GetResult<Prisma.$POIPayload, S>

  type POICountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<POIFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: POICountAggregateInputType | true
    }

  export interface POIDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['POI'], meta: { name: 'POI' } }
    /**
     * Find zero or one POI that matches the filter.
     * @param {POIFindUniqueArgs} args - Arguments to find a POI
     * @example
     * // Get one POI
     * const pOI = await prisma.pOI.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends POIFindUniqueArgs>(args: SelectSubset<T, POIFindUniqueArgs<ExtArgs>>): Prisma__POIClient<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one POI that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {POIFindUniqueOrThrowArgs} args - Arguments to find a POI
     * @example
     * // Get one POI
     * const pOI = await prisma.pOI.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends POIFindUniqueOrThrowArgs>(args: SelectSubset<T, POIFindUniqueOrThrowArgs<ExtArgs>>): Prisma__POIClient<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first POI that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {POIFindFirstArgs} args - Arguments to find a POI
     * @example
     * // Get one POI
     * const pOI = await prisma.pOI.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends POIFindFirstArgs>(args?: SelectSubset<T, POIFindFirstArgs<ExtArgs>>): Prisma__POIClient<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first POI that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {POIFindFirstOrThrowArgs} args - Arguments to find a POI
     * @example
     * // Get one POI
     * const pOI = await prisma.pOI.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends POIFindFirstOrThrowArgs>(args?: SelectSubset<T, POIFindFirstOrThrowArgs<ExtArgs>>): Prisma__POIClient<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more POIS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {POIFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all POIS
     * const pOIS = await prisma.pOI.findMany()
     * 
     * // Get first 10 POIS
     * const pOIS = await prisma.pOI.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pOIWithIdOnly = await prisma.pOI.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends POIFindManyArgs>(args?: SelectSubset<T, POIFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a POI.
     * @param {POICreateArgs} args - Arguments to create a POI.
     * @example
     * // Create one POI
     * const POI = await prisma.pOI.create({
     *   data: {
     *     // ... data to create a POI
     *   }
     * })
     * 
     */
    create<T extends POICreateArgs>(args: SelectSubset<T, POICreateArgs<ExtArgs>>): Prisma__POIClient<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many POIS.
     * @param {POICreateManyArgs} args - Arguments to create many POIS.
     * @example
     * // Create many POIS
     * const pOI = await prisma.pOI.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends POICreateManyArgs>(args?: SelectSubset<T, POICreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many POIS and returns the data saved in the database.
     * @param {POICreateManyAndReturnArgs} args - Arguments to create many POIS.
     * @example
     * // Create many POIS
     * const pOI = await prisma.pOI.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many POIS and only return the `id`
     * const pOIWithIdOnly = await prisma.pOI.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends POICreateManyAndReturnArgs>(args?: SelectSubset<T, POICreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a POI.
     * @param {POIDeleteArgs} args - Arguments to delete one POI.
     * @example
     * // Delete one POI
     * const POI = await prisma.pOI.delete({
     *   where: {
     *     // ... filter to delete one POI
     *   }
     * })
     * 
     */
    delete<T extends POIDeleteArgs>(args: SelectSubset<T, POIDeleteArgs<ExtArgs>>): Prisma__POIClient<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one POI.
     * @param {POIUpdateArgs} args - Arguments to update one POI.
     * @example
     * // Update one POI
     * const pOI = await prisma.pOI.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends POIUpdateArgs>(args: SelectSubset<T, POIUpdateArgs<ExtArgs>>): Prisma__POIClient<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more POIS.
     * @param {POIDeleteManyArgs} args - Arguments to filter POIS to delete.
     * @example
     * // Delete a few POIS
     * const { count } = await prisma.pOI.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends POIDeleteManyArgs>(args?: SelectSubset<T, POIDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more POIS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {POIUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many POIS
     * const pOI = await prisma.pOI.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends POIUpdateManyArgs>(args: SelectSubset<T, POIUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more POIS and returns the data updated in the database.
     * @param {POIUpdateManyAndReturnArgs} args - Arguments to update many POIS.
     * @example
     * // Update many POIS
     * const pOI = await prisma.pOI.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more POIS and only return the `id`
     * const pOIWithIdOnly = await prisma.pOI.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends POIUpdateManyAndReturnArgs>(args: SelectSubset<T, POIUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one POI.
     * @param {POIUpsertArgs} args - Arguments to update or create a POI.
     * @example
     * // Update or create a POI
     * const pOI = await prisma.pOI.upsert({
     *   create: {
     *     // ... data to create a POI
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the POI we want to update
     *   }
     * })
     */
    upsert<T extends POIUpsertArgs>(args: SelectSubset<T, POIUpsertArgs<ExtArgs>>): Prisma__POIClient<$Result.GetResult<Prisma.$POIPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of POIS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {POICountArgs} args - Arguments to filter POIS to count.
     * @example
     * // Count the number of POIS
     * const count = await prisma.pOI.count({
     *   where: {
     *     // ... the filter for the POIS we want to count
     *   }
     * })
    **/
    count<T extends POICountArgs>(
      args?: Subset<T, POICountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], POICountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a POI.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {POIAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends POIAggregateArgs>(args: Subset<T, POIAggregateArgs>): Prisma.PrismaPromise<GetPOIAggregateType<T>>

    /**
     * Group by POI.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {POIGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends POIGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: POIGroupByArgs['orderBy'] }
        : { orderBy?: POIGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, POIGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPOIGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the POI model
   */
  readonly fields: POIFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for POI.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__POIClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the POI model
   */
  interface POIFieldRefs {
    readonly id: FieldRef<"POI", 'Int'>
    readonly name: FieldRef<"POI", 'String'>
    readonly description: FieldRef<"POI", 'String'>
    readonly latitude: FieldRef<"POI", 'Float'>
    readonly longitude: FieldRef<"POI", 'Float'>
    readonly embedding: FieldRef<"POI", 'Float[]'>
    readonly createdAt: FieldRef<"POI", 'DateTime'>
    readonly updatedAt: FieldRef<"POI", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * POI findUnique
   */
  export type POIFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * Filter, which POI to fetch.
     */
    where: POIWhereUniqueInput
  }

  /**
   * POI findUniqueOrThrow
   */
  export type POIFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * Filter, which POI to fetch.
     */
    where: POIWhereUniqueInput
  }

  /**
   * POI findFirst
   */
  export type POIFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * Filter, which POI to fetch.
     */
    where?: POIWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of POIS to fetch.
     */
    orderBy?: POIOrderByWithRelationInput | POIOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for POIS.
     */
    cursor?: POIWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` POIS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` POIS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of POIS.
     */
    distinct?: POIScalarFieldEnum | POIScalarFieldEnum[]
  }

  /**
   * POI findFirstOrThrow
   */
  export type POIFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * Filter, which POI to fetch.
     */
    where?: POIWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of POIS to fetch.
     */
    orderBy?: POIOrderByWithRelationInput | POIOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for POIS.
     */
    cursor?: POIWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` POIS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` POIS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of POIS.
     */
    distinct?: POIScalarFieldEnum | POIScalarFieldEnum[]
  }

  /**
   * POI findMany
   */
  export type POIFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * Filter, which POIS to fetch.
     */
    where?: POIWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of POIS to fetch.
     */
    orderBy?: POIOrderByWithRelationInput | POIOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing POIS.
     */
    cursor?: POIWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` POIS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` POIS.
     */
    skip?: number
    distinct?: POIScalarFieldEnum | POIScalarFieldEnum[]
  }

  /**
   * POI create
   */
  export type POICreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * The data needed to create a POI.
     */
    data: XOR<POICreateInput, POIUncheckedCreateInput>
  }

  /**
   * POI createMany
   */
  export type POICreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many POIS.
     */
    data: POICreateManyInput | POICreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * POI createManyAndReturn
   */
  export type POICreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * The data used to create many POIS.
     */
    data: POICreateManyInput | POICreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * POI update
   */
  export type POIUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * The data needed to update a POI.
     */
    data: XOR<POIUpdateInput, POIUncheckedUpdateInput>
    /**
     * Choose, which POI to update.
     */
    where: POIWhereUniqueInput
  }

  /**
   * POI updateMany
   */
  export type POIUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update POIS.
     */
    data: XOR<POIUpdateManyMutationInput, POIUncheckedUpdateManyInput>
    /**
     * Filter which POIS to update
     */
    where?: POIWhereInput
    /**
     * Limit how many POIS to update.
     */
    limit?: number
  }

  /**
   * POI updateManyAndReturn
   */
  export type POIUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * The data used to update POIS.
     */
    data: XOR<POIUpdateManyMutationInput, POIUncheckedUpdateManyInput>
    /**
     * Filter which POIS to update
     */
    where?: POIWhereInput
    /**
     * Limit how many POIS to update.
     */
    limit?: number
  }

  /**
   * POI upsert
   */
  export type POIUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * The filter to search for the POI to update in case it exists.
     */
    where: POIWhereUniqueInput
    /**
     * In case the POI found by the `where` argument doesn't exist, create a new POI with this data.
     */
    create: XOR<POICreateInput, POIUncheckedCreateInput>
    /**
     * In case the POI was found with the provided `where` argument, update it with this data.
     */
    update: XOR<POIUpdateInput, POIUncheckedUpdateInput>
  }

  /**
   * POI delete
   */
  export type POIDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
    /**
     * Filter which POI to delete.
     */
    where: POIWhereUniqueInput
  }

  /**
   * POI deleteMany
   */
  export type POIDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which POIS to delete
     */
    where?: POIWhereInput
    /**
     * Limit how many POIS to delete.
     */
    limit?: number
  }

  /**
   * POI without action
   */
  export type POIDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the POI
     */
    select?: POISelect<ExtArgs> | null
    /**
     * Omit specific fields from the POI
     */
    omit?: POIOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const PropertyScalarFieldEnum: {
    id: 'id',
    name: 'name',
    address: 'address',
    landlordId: 'landlordId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PropertyScalarFieldEnum = (typeof PropertyScalarFieldEnum)[keyof typeof PropertyScalarFieldEnum]


  export const UnitScalarFieldEnum: {
    id: 'id',
    propertyId: 'propertyId',
    tenantId: 'tenantId',
    rentAmount: 'rentAmount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UnitScalarFieldEnum = (typeof UnitScalarFieldEnum)[keyof typeof UnitScalarFieldEnum]


  export const RentPaymentScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    unitId: 'unitId',
    amount: 'amount',
    dueDate: 'dueDate',
    status: 'status',
    penalty: 'penalty',
    paidAt: 'paidAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RentPaymentScalarFieldEnum = (typeof RentPaymentScalarFieldEnum)[keyof typeof RentPaymentScalarFieldEnum]


  export const WaterBillScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    reading: 'reading',
    amount: 'amount',
    status: 'status',
    paidAt: 'paidAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WaterBillScalarFieldEnum = (typeof WaterBillScalarFieldEnum)[keyof typeof WaterBillScalarFieldEnum]


  export const ElectricityBillScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    tokens: 'tokens',
    amount: 'amount',
    status: 'status',
    paidAt: 'paidAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ElectricityBillScalarFieldEnum = (typeof ElectricityBillScalarFieldEnum)[keyof typeof ElectricityBillScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    title: 'title',
    message: 'message',
    isRead: 'isRead',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const POIScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    latitude: 'latitude',
    longitude: 'longitude',
    embedding: 'embedding',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type POIScalarFieldEnum = (typeof POIScalarFieldEnum)[keyof typeof POIScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'PaymentStatus'
   */
  export type EnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus'>
    


  /**
   * Reference to a field of type 'PaymentStatus[]'
   */
  export type ListEnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    properties?: PropertyListRelationFilter
    units?: UnitListRelationFilter
    payments?: RentPaymentListRelationFilter
    waterBills?: WaterBillListRelationFilter
    electricityBills?: ElectricityBillListRelationFilter
    notifications?: NotificationListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    properties?: PropertyOrderByRelationAggregateInput
    units?: UnitOrderByRelationAggregateInput
    payments?: RentPaymentOrderByRelationAggregateInput
    waterBills?: WaterBillOrderByRelationAggregateInput
    electricityBills?: ElectricityBillOrderByRelationAggregateInput
    notifications?: NotificationOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    properties?: PropertyListRelationFilter
    units?: UnitListRelationFilter
    payments?: RentPaymentListRelationFilter
    waterBills?: WaterBillListRelationFilter
    electricityBills?: ElectricityBillListRelationFilter
    notifications?: NotificationListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type PropertyWhereInput = {
    AND?: PropertyWhereInput | PropertyWhereInput[]
    OR?: PropertyWhereInput[]
    NOT?: PropertyWhereInput | PropertyWhereInput[]
    id?: IntFilter<"Property"> | number
    name?: StringFilter<"Property"> | string
    address?: StringFilter<"Property"> | string
    landlordId?: IntFilter<"Property"> | number
    createdAt?: DateTimeFilter<"Property"> | Date | string
    updatedAt?: DateTimeFilter<"Property"> | Date | string
    landlord?: XOR<UserScalarRelationFilter, UserWhereInput>
    units?: UnitListRelationFilter
  }

  export type PropertyOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    landlordId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    landlord?: UserOrderByWithRelationInput
    units?: UnitOrderByRelationAggregateInput
  }

  export type PropertyWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: PropertyWhereInput | PropertyWhereInput[]
    OR?: PropertyWhereInput[]
    NOT?: PropertyWhereInput | PropertyWhereInput[]
    name?: StringFilter<"Property"> | string
    address?: StringFilter<"Property"> | string
    landlordId?: IntFilter<"Property"> | number
    createdAt?: DateTimeFilter<"Property"> | Date | string
    updatedAt?: DateTimeFilter<"Property"> | Date | string
    landlord?: XOR<UserScalarRelationFilter, UserWhereInput>
    units?: UnitListRelationFilter
  }, "id">

  export type PropertyOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    landlordId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PropertyCountOrderByAggregateInput
    _avg?: PropertyAvgOrderByAggregateInput
    _max?: PropertyMaxOrderByAggregateInput
    _min?: PropertyMinOrderByAggregateInput
    _sum?: PropertySumOrderByAggregateInput
  }

  export type PropertyScalarWhereWithAggregatesInput = {
    AND?: PropertyScalarWhereWithAggregatesInput | PropertyScalarWhereWithAggregatesInput[]
    OR?: PropertyScalarWhereWithAggregatesInput[]
    NOT?: PropertyScalarWhereWithAggregatesInput | PropertyScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Property"> | number
    name?: StringWithAggregatesFilter<"Property"> | string
    address?: StringWithAggregatesFilter<"Property"> | string
    landlordId?: IntWithAggregatesFilter<"Property"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Property"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Property"> | Date | string
  }

  export type UnitWhereInput = {
    AND?: UnitWhereInput | UnitWhereInput[]
    OR?: UnitWhereInput[]
    NOT?: UnitWhereInput | UnitWhereInput[]
    id?: IntFilter<"Unit"> | number
    propertyId?: IntFilter<"Unit"> | number
    tenantId?: IntNullableFilter<"Unit"> | number | null
    rentAmount?: FloatFilter<"Unit"> | number
    createdAt?: DateTimeFilter<"Unit"> | Date | string
    updatedAt?: DateTimeFilter<"Unit"> | Date | string
    property?: XOR<PropertyScalarRelationFilter, PropertyWhereInput>
    tenant?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    rentPayments?: RentPaymentListRelationFilter
  }

  export type UnitOrderByWithRelationInput = {
    id?: SortOrder
    propertyId?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    rentAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    property?: PropertyOrderByWithRelationInput
    tenant?: UserOrderByWithRelationInput
    rentPayments?: RentPaymentOrderByRelationAggregateInput
  }

  export type UnitWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: UnitWhereInput | UnitWhereInput[]
    OR?: UnitWhereInput[]
    NOT?: UnitWhereInput | UnitWhereInput[]
    propertyId?: IntFilter<"Unit"> | number
    tenantId?: IntNullableFilter<"Unit"> | number | null
    rentAmount?: FloatFilter<"Unit"> | number
    createdAt?: DateTimeFilter<"Unit"> | Date | string
    updatedAt?: DateTimeFilter<"Unit"> | Date | string
    property?: XOR<PropertyScalarRelationFilter, PropertyWhereInput>
    tenant?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    rentPayments?: RentPaymentListRelationFilter
  }, "id">

  export type UnitOrderByWithAggregationInput = {
    id?: SortOrder
    propertyId?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    rentAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UnitCountOrderByAggregateInput
    _avg?: UnitAvgOrderByAggregateInput
    _max?: UnitMaxOrderByAggregateInput
    _min?: UnitMinOrderByAggregateInput
    _sum?: UnitSumOrderByAggregateInput
  }

  export type UnitScalarWhereWithAggregatesInput = {
    AND?: UnitScalarWhereWithAggregatesInput | UnitScalarWhereWithAggregatesInput[]
    OR?: UnitScalarWhereWithAggregatesInput[]
    NOT?: UnitScalarWhereWithAggregatesInput | UnitScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Unit"> | number
    propertyId?: IntWithAggregatesFilter<"Unit"> | number
    tenantId?: IntNullableWithAggregatesFilter<"Unit"> | number | null
    rentAmount?: FloatWithAggregatesFilter<"Unit"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Unit"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Unit"> | Date | string
  }

  export type RentPaymentWhereInput = {
    AND?: RentPaymentWhereInput | RentPaymentWhereInput[]
    OR?: RentPaymentWhereInput[]
    NOT?: RentPaymentWhereInput | RentPaymentWhereInput[]
    id?: IntFilter<"RentPayment"> | number
    tenantId?: IntFilter<"RentPayment"> | number
    unitId?: IntFilter<"RentPayment"> | number
    amount?: FloatFilter<"RentPayment"> | number
    dueDate?: DateTimeFilter<"RentPayment"> | Date | string
    status?: EnumPaymentStatusFilter<"RentPayment"> | $Enums.PaymentStatus
    penalty?: FloatFilter<"RentPayment"> | number
    paidAt?: DateTimeNullableFilter<"RentPayment"> | Date | string | null
    createdAt?: DateTimeFilter<"RentPayment"> | Date | string
    updatedAt?: DateTimeFilter<"RentPayment"> | Date | string
    tenant?: XOR<UserScalarRelationFilter, UserWhereInput>
    unit?: XOR<UnitScalarRelationFilter, UnitWhereInput>
  }

  export type RentPaymentOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    unitId?: SortOrder
    amount?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    penalty?: SortOrder
    paidAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: UserOrderByWithRelationInput
    unit?: UnitOrderByWithRelationInput
  }

  export type RentPaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RentPaymentWhereInput | RentPaymentWhereInput[]
    OR?: RentPaymentWhereInput[]
    NOT?: RentPaymentWhereInput | RentPaymentWhereInput[]
    tenantId?: IntFilter<"RentPayment"> | number
    unitId?: IntFilter<"RentPayment"> | number
    amount?: FloatFilter<"RentPayment"> | number
    dueDate?: DateTimeFilter<"RentPayment"> | Date | string
    status?: EnumPaymentStatusFilter<"RentPayment"> | $Enums.PaymentStatus
    penalty?: FloatFilter<"RentPayment"> | number
    paidAt?: DateTimeNullableFilter<"RentPayment"> | Date | string | null
    createdAt?: DateTimeFilter<"RentPayment"> | Date | string
    updatedAt?: DateTimeFilter<"RentPayment"> | Date | string
    tenant?: XOR<UserScalarRelationFilter, UserWhereInput>
    unit?: XOR<UnitScalarRelationFilter, UnitWhereInput>
  }, "id">

  export type RentPaymentOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    unitId?: SortOrder
    amount?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    penalty?: SortOrder
    paidAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RentPaymentCountOrderByAggregateInput
    _avg?: RentPaymentAvgOrderByAggregateInput
    _max?: RentPaymentMaxOrderByAggregateInput
    _min?: RentPaymentMinOrderByAggregateInput
    _sum?: RentPaymentSumOrderByAggregateInput
  }

  export type RentPaymentScalarWhereWithAggregatesInput = {
    AND?: RentPaymentScalarWhereWithAggregatesInput | RentPaymentScalarWhereWithAggregatesInput[]
    OR?: RentPaymentScalarWhereWithAggregatesInput[]
    NOT?: RentPaymentScalarWhereWithAggregatesInput | RentPaymentScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"RentPayment"> | number
    tenantId?: IntWithAggregatesFilter<"RentPayment"> | number
    unitId?: IntWithAggregatesFilter<"RentPayment"> | number
    amount?: FloatWithAggregatesFilter<"RentPayment"> | number
    dueDate?: DateTimeWithAggregatesFilter<"RentPayment"> | Date | string
    status?: EnumPaymentStatusWithAggregatesFilter<"RentPayment"> | $Enums.PaymentStatus
    penalty?: FloatWithAggregatesFilter<"RentPayment"> | number
    paidAt?: DateTimeNullableWithAggregatesFilter<"RentPayment"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"RentPayment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RentPayment"> | Date | string
  }

  export type WaterBillWhereInput = {
    AND?: WaterBillWhereInput | WaterBillWhereInput[]
    OR?: WaterBillWhereInput[]
    NOT?: WaterBillWhereInput | WaterBillWhereInput[]
    id?: IntFilter<"WaterBill"> | number
    tenantId?: IntFilter<"WaterBill"> | number
    reading?: FloatFilter<"WaterBill"> | number
    amount?: FloatFilter<"WaterBill"> | number
    status?: EnumPaymentStatusFilter<"WaterBill"> | $Enums.PaymentStatus
    paidAt?: DateTimeNullableFilter<"WaterBill"> | Date | string | null
    createdAt?: DateTimeFilter<"WaterBill"> | Date | string
    updatedAt?: DateTimeFilter<"WaterBill"> | Date | string
    tenant?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type WaterBillOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    reading?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: UserOrderByWithRelationInput
  }

  export type WaterBillWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: WaterBillWhereInput | WaterBillWhereInput[]
    OR?: WaterBillWhereInput[]
    NOT?: WaterBillWhereInput | WaterBillWhereInput[]
    tenantId?: IntFilter<"WaterBill"> | number
    reading?: FloatFilter<"WaterBill"> | number
    amount?: FloatFilter<"WaterBill"> | number
    status?: EnumPaymentStatusFilter<"WaterBill"> | $Enums.PaymentStatus
    paidAt?: DateTimeNullableFilter<"WaterBill"> | Date | string | null
    createdAt?: DateTimeFilter<"WaterBill"> | Date | string
    updatedAt?: DateTimeFilter<"WaterBill"> | Date | string
    tenant?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type WaterBillOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    reading?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WaterBillCountOrderByAggregateInput
    _avg?: WaterBillAvgOrderByAggregateInput
    _max?: WaterBillMaxOrderByAggregateInput
    _min?: WaterBillMinOrderByAggregateInput
    _sum?: WaterBillSumOrderByAggregateInput
  }

  export type WaterBillScalarWhereWithAggregatesInput = {
    AND?: WaterBillScalarWhereWithAggregatesInput | WaterBillScalarWhereWithAggregatesInput[]
    OR?: WaterBillScalarWhereWithAggregatesInput[]
    NOT?: WaterBillScalarWhereWithAggregatesInput | WaterBillScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"WaterBill"> | number
    tenantId?: IntWithAggregatesFilter<"WaterBill"> | number
    reading?: FloatWithAggregatesFilter<"WaterBill"> | number
    amount?: FloatWithAggregatesFilter<"WaterBill"> | number
    status?: EnumPaymentStatusWithAggregatesFilter<"WaterBill"> | $Enums.PaymentStatus
    paidAt?: DateTimeNullableWithAggregatesFilter<"WaterBill"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"WaterBill"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WaterBill"> | Date | string
  }

  export type ElectricityBillWhereInput = {
    AND?: ElectricityBillWhereInput | ElectricityBillWhereInput[]
    OR?: ElectricityBillWhereInput[]
    NOT?: ElectricityBillWhereInput | ElectricityBillWhereInput[]
    id?: IntFilter<"ElectricityBill"> | number
    tenantId?: IntFilter<"ElectricityBill"> | number
    tokens?: IntFilter<"ElectricityBill"> | number
    amount?: FloatFilter<"ElectricityBill"> | number
    status?: EnumPaymentStatusFilter<"ElectricityBill"> | $Enums.PaymentStatus
    paidAt?: DateTimeNullableFilter<"ElectricityBill"> | Date | string | null
    createdAt?: DateTimeFilter<"ElectricityBill"> | Date | string
    updatedAt?: DateTimeFilter<"ElectricityBill"> | Date | string
    tenant?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ElectricityBillOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    tokens?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: UserOrderByWithRelationInput
  }

  export type ElectricityBillWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ElectricityBillWhereInput | ElectricityBillWhereInput[]
    OR?: ElectricityBillWhereInput[]
    NOT?: ElectricityBillWhereInput | ElectricityBillWhereInput[]
    tenantId?: IntFilter<"ElectricityBill"> | number
    tokens?: IntFilter<"ElectricityBill"> | number
    amount?: FloatFilter<"ElectricityBill"> | number
    status?: EnumPaymentStatusFilter<"ElectricityBill"> | $Enums.PaymentStatus
    paidAt?: DateTimeNullableFilter<"ElectricityBill"> | Date | string | null
    createdAt?: DateTimeFilter<"ElectricityBill"> | Date | string
    updatedAt?: DateTimeFilter<"ElectricityBill"> | Date | string
    tenant?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type ElectricityBillOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    tokens?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ElectricityBillCountOrderByAggregateInput
    _avg?: ElectricityBillAvgOrderByAggregateInput
    _max?: ElectricityBillMaxOrderByAggregateInput
    _min?: ElectricityBillMinOrderByAggregateInput
    _sum?: ElectricityBillSumOrderByAggregateInput
  }

  export type ElectricityBillScalarWhereWithAggregatesInput = {
    AND?: ElectricityBillScalarWhereWithAggregatesInput | ElectricityBillScalarWhereWithAggregatesInput[]
    OR?: ElectricityBillScalarWhereWithAggregatesInput[]
    NOT?: ElectricityBillScalarWhereWithAggregatesInput | ElectricityBillScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ElectricityBill"> | number
    tenantId?: IntWithAggregatesFilter<"ElectricityBill"> | number
    tokens?: IntWithAggregatesFilter<"ElectricityBill"> | number
    amount?: FloatWithAggregatesFilter<"ElectricityBill"> | number
    status?: EnumPaymentStatusWithAggregatesFilter<"ElectricityBill"> | $Enums.PaymentStatus
    paidAt?: DateTimeNullableWithAggregatesFilter<"ElectricityBill"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ElectricityBill"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ElectricityBill"> | Date | string
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: IntFilter<"Notification"> | number
    userId?: IntFilter<"Notification"> | number
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    userId?: IntFilter<"Notification"> | number
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _avg?: NotificationAvgOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
    _sum?: NotificationSumOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Notification"> | number
    userId?: IntWithAggregatesFilter<"Notification"> | number
    title?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    isRead?: BoolWithAggregatesFilter<"Notification"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
  }

  export type POIWhereInput = {
    AND?: POIWhereInput | POIWhereInput[]
    OR?: POIWhereInput[]
    NOT?: POIWhereInput | POIWhereInput[]
    id?: IntFilter<"POI"> | number
    name?: StringFilter<"POI"> | string
    description?: StringNullableFilter<"POI"> | string | null
    latitude?: FloatFilter<"POI"> | number
    longitude?: FloatFilter<"POI"> | number
    embedding?: FloatNullableListFilter<"POI">
    createdAt?: DateTimeFilter<"POI"> | Date | string
    updatedAt?: DateTimeFilter<"POI"> | Date | string
  }

  export type POIOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    embedding?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type POIWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: POIWhereInput | POIWhereInput[]
    OR?: POIWhereInput[]
    NOT?: POIWhereInput | POIWhereInput[]
    name?: StringFilter<"POI"> | string
    description?: StringNullableFilter<"POI"> | string | null
    latitude?: FloatFilter<"POI"> | number
    longitude?: FloatFilter<"POI"> | number
    embedding?: FloatNullableListFilter<"POI">
    createdAt?: DateTimeFilter<"POI"> | Date | string
    updatedAt?: DateTimeFilter<"POI"> | Date | string
  }, "id">

  export type POIOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    embedding?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: POICountOrderByAggregateInput
    _avg?: POIAvgOrderByAggregateInput
    _max?: POIMaxOrderByAggregateInput
    _min?: POIMinOrderByAggregateInput
    _sum?: POISumOrderByAggregateInput
  }

  export type POIScalarWhereWithAggregatesInput = {
    AND?: POIScalarWhereWithAggregatesInput | POIScalarWhereWithAggregatesInput[]
    OR?: POIScalarWhereWithAggregatesInput[]
    NOT?: POIScalarWhereWithAggregatesInput | POIScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"POI"> | number
    name?: StringWithAggregatesFilter<"POI"> | string
    description?: StringNullableWithAggregatesFilter<"POI"> | string | null
    latitude?: FloatWithAggregatesFilter<"POI"> | number
    longitude?: FloatWithAggregatesFilter<"POI"> | number
    embedding?: FloatNullableListFilter<"POI">
    createdAt?: DateTimeWithAggregatesFilter<"POI"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"POI"> | Date | string
  }

  export type UserCreateInput = {
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyCreateNestedManyWithoutLandlordInput
    units?: UnitCreateNestedManyWithoutTenantInput
    payments?: RentPaymentCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillCreateNestedManyWithoutTenantInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyUncheckedCreateNestedManyWithoutLandlordInput
    units?: UnitUncheckedCreateNestedManyWithoutTenantInput
    payments?: RentPaymentUncheckedCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillUncheckedCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillUncheckedCreateNestedManyWithoutTenantInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUpdateManyWithoutLandlordNestedInput
    units?: UnitUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUncheckedUpdateManyWithoutLandlordNestedInput
    units?: UnitUncheckedUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUncheckedUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUncheckedUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUncheckedUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PropertyCreateInput = {
    name: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    landlord: UserCreateNestedOneWithoutPropertiesInput
    units?: UnitCreateNestedManyWithoutPropertyInput
  }

  export type PropertyUncheckedCreateInput = {
    id?: number
    name: string
    address: string
    landlordId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    units?: UnitUncheckedCreateNestedManyWithoutPropertyInput
  }

  export type PropertyUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    landlord?: UserUpdateOneRequiredWithoutPropertiesNestedInput
    units?: UnitUpdateManyWithoutPropertyNestedInput
  }

  export type PropertyUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    landlordId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    units?: UnitUncheckedUpdateManyWithoutPropertyNestedInput
  }

  export type PropertyCreateManyInput = {
    id?: number
    name: string
    address: string
    landlordId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PropertyUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PropertyUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    landlordId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitCreateInput = {
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
    property: PropertyCreateNestedOneWithoutUnitsInput
    tenant?: UserCreateNestedOneWithoutUnitsInput
    rentPayments?: RentPaymentCreateNestedManyWithoutUnitInput
  }

  export type UnitUncheckedCreateInput = {
    id?: number
    propertyId: number
    tenantId?: number | null
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rentPayments?: RentPaymentUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitUpdateInput = {
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    property?: PropertyUpdateOneRequiredWithoutUnitsNestedInput
    tenant?: UserUpdateOneWithoutUnitsNestedInput
    rentPayments?: RentPaymentUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    propertyId?: IntFieldUpdateOperationsInput | number
    tenantId?: NullableIntFieldUpdateOperationsInput | number | null
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rentPayments?: RentPaymentUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type UnitCreateManyInput = {
    id?: number
    propertyId: number
    tenantId?: number | null
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitUpdateManyMutationInput = {
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    propertyId?: IntFieldUpdateOperationsInput | number
    tenantId?: NullableIntFieldUpdateOperationsInput | number | null
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RentPaymentCreateInput = {
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: UserCreateNestedOneWithoutPaymentsInput
    unit: UnitCreateNestedOneWithoutRentPaymentsInput
  }

  export type RentPaymentUncheckedCreateInput = {
    id?: number
    tenantId: number
    unitId: number
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RentPaymentUpdateInput = {
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: UserUpdateOneRequiredWithoutPaymentsNestedInput
    unit?: UnitUpdateOneRequiredWithoutRentPaymentsNestedInput
  }

  export type RentPaymentUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: IntFieldUpdateOperationsInput | number
    unitId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RentPaymentCreateManyInput = {
    id?: number
    tenantId: number
    unitId: number
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RentPaymentUpdateManyMutationInput = {
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RentPaymentUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: IntFieldUpdateOperationsInput | number
    unitId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterBillCreateInput = {
    reading: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: UserCreateNestedOneWithoutWaterBillsInput
  }

  export type WaterBillUncheckedCreateInput = {
    id?: number
    tenantId: number
    reading: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaterBillUpdateInput = {
    reading?: FloatFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: UserUpdateOneRequiredWithoutWaterBillsNestedInput
  }

  export type WaterBillUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: IntFieldUpdateOperationsInput | number
    reading?: FloatFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterBillCreateManyInput = {
    id?: number
    tenantId: number
    reading: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaterBillUpdateManyMutationInput = {
    reading?: FloatFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterBillUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: IntFieldUpdateOperationsInput | number
    reading?: FloatFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElectricityBillCreateInput = {
    tokens: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: UserCreateNestedOneWithoutElectricityBillsInput
  }

  export type ElectricityBillUncheckedCreateInput = {
    id?: number
    tenantId: number
    tokens: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElectricityBillUpdateInput = {
    tokens?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: UserUpdateOneRequiredWithoutElectricityBillsNestedInput
  }

  export type ElectricityBillUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: IntFieldUpdateOperationsInput | number
    tokens?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElectricityBillCreateManyInput = {
    id?: number
    tenantId: number
    tokens: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElectricityBillUpdateManyMutationInput = {
    tokens?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElectricityBillUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: IntFieldUpdateOperationsInput | number
    tokens?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateInput = {
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateInput = {
    id?: number
    userId: number
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateManyInput = {
    id?: number
    userId: number
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type POICreateInput = {
    name: string
    description?: string | null
    latitude: number
    longitude: number
    embedding?: POICreateembeddingInput | number[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type POIUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    latitude: number
    longitude: number
    embedding?: POICreateembeddingInput | number[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type POIUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    embedding?: POIUpdateembeddingInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type POIUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    embedding?: POIUpdateembeddingInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type POICreateManyInput = {
    id?: number
    name: string
    description?: string | null
    latitude: number
    longitude: number
    embedding?: POICreateembeddingInput | number[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type POIUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    embedding?: POIUpdateembeddingInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type POIUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    embedding?: POIUpdateembeddingInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type PropertyListRelationFilter = {
    every?: PropertyWhereInput
    some?: PropertyWhereInput
    none?: PropertyWhereInput
  }

  export type UnitListRelationFilter = {
    every?: UnitWhereInput
    some?: UnitWhereInput
    none?: UnitWhereInput
  }

  export type RentPaymentListRelationFilter = {
    every?: RentPaymentWhereInput
    some?: RentPaymentWhereInput
    none?: RentPaymentWhereInput
  }

  export type WaterBillListRelationFilter = {
    every?: WaterBillWhereInput
    some?: WaterBillWhereInput
    none?: WaterBillWhereInput
  }

  export type ElectricityBillListRelationFilter = {
    every?: ElectricityBillWhereInput
    some?: ElectricityBillWhereInput
    none?: ElectricityBillWhereInput
  }

  export type NotificationListRelationFilter = {
    every?: NotificationWhereInput
    some?: NotificationWhereInput
    none?: NotificationWhereInput
  }

  export type PropertyOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UnitOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RentPaymentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WaterBillOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ElectricityBillOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NotificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type PropertyCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    landlordId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PropertyAvgOrderByAggregateInput = {
    id?: SortOrder
    landlordId?: SortOrder
  }

  export type PropertyMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    landlordId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PropertyMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    landlordId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PropertySumOrderByAggregateInput = {
    id?: SortOrder
    landlordId?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type PropertyScalarRelationFilter = {
    is?: PropertyWhereInput
    isNot?: PropertyWhereInput
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UnitCountOrderByAggregateInput = {
    id?: SortOrder
    propertyId?: SortOrder
    tenantId?: SortOrder
    rentAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitAvgOrderByAggregateInput = {
    id?: SortOrder
    propertyId?: SortOrder
    tenantId?: SortOrder
    rentAmount?: SortOrder
  }

  export type UnitMaxOrderByAggregateInput = {
    id?: SortOrder
    propertyId?: SortOrder
    tenantId?: SortOrder
    rentAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitMinOrderByAggregateInput = {
    id?: SortOrder
    propertyId?: SortOrder
    tenantId?: SortOrder
    rentAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitSumOrderByAggregateInput = {
    id?: SortOrder
    propertyId?: SortOrder
    tenantId?: SortOrder
    rentAmount?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UnitScalarRelationFilter = {
    is?: UnitWhereInput
    isNot?: UnitWhereInput
  }

  export type RentPaymentCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    unitId?: SortOrder
    amount?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    penalty?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RentPaymentAvgOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    unitId?: SortOrder
    amount?: SortOrder
    penalty?: SortOrder
  }

  export type RentPaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    unitId?: SortOrder
    amount?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    penalty?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RentPaymentMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    unitId?: SortOrder
    amount?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    penalty?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RentPaymentSumOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    unitId?: SortOrder
    amount?: SortOrder
    penalty?: SortOrder
  }

  export type EnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type WaterBillCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    reading?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WaterBillAvgOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    reading?: SortOrder
    amount?: SortOrder
  }

  export type WaterBillMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    reading?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WaterBillMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    reading?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WaterBillSumOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    reading?: SortOrder
    amount?: SortOrder
  }

  export type ElectricityBillCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    tokens?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElectricityBillAvgOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    tokens?: SortOrder
    amount?: SortOrder
  }

  export type ElectricityBillMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    tokens?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElectricityBillMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    tokens?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElectricityBillSumOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    tokens?: SortOrder
    amount?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    has?: number | FloatFieldRefInput<$PrismaModel> | null
    hasEvery?: number[] | ListFloatFieldRefInput<$PrismaModel>
    hasSome?: number[] | ListFloatFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type POICountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    embedding?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type POIAvgOrderByAggregateInput = {
    id?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    embedding?: SortOrder
  }

  export type POIMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type POIMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type POISumOrderByAggregateInput = {
    id?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    embedding?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type PropertyCreateNestedManyWithoutLandlordInput = {
    create?: XOR<PropertyCreateWithoutLandlordInput, PropertyUncheckedCreateWithoutLandlordInput> | PropertyCreateWithoutLandlordInput[] | PropertyUncheckedCreateWithoutLandlordInput[]
    connectOrCreate?: PropertyCreateOrConnectWithoutLandlordInput | PropertyCreateOrConnectWithoutLandlordInput[]
    createMany?: PropertyCreateManyLandlordInputEnvelope
    connect?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
  }

  export type UnitCreateNestedManyWithoutTenantInput = {
    create?: XOR<UnitCreateWithoutTenantInput, UnitUncheckedCreateWithoutTenantInput> | UnitCreateWithoutTenantInput[] | UnitUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UnitCreateOrConnectWithoutTenantInput | UnitCreateOrConnectWithoutTenantInput[]
    createMany?: UnitCreateManyTenantInputEnvelope
    connect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
  }

  export type RentPaymentCreateNestedManyWithoutTenantInput = {
    create?: XOR<RentPaymentCreateWithoutTenantInput, RentPaymentUncheckedCreateWithoutTenantInput> | RentPaymentCreateWithoutTenantInput[] | RentPaymentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: RentPaymentCreateOrConnectWithoutTenantInput | RentPaymentCreateOrConnectWithoutTenantInput[]
    createMany?: RentPaymentCreateManyTenantInputEnvelope
    connect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
  }

  export type WaterBillCreateNestedManyWithoutTenantInput = {
    create?: XOR<WaterBillCreateWithoutTenantInput, WaterBillUncheckedCreateWithoutTenantInput> | WaterBillCreateWithoutTenantInput[] | WaterBillUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: WaterBillCreateOrConnectWithoutTenantInput | WaterBillCreateOrConnectWithoutTenantInput[]
    createMany?: WaterBillCreateManyTenantInputEnvelope
    connect?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
  }

  export type ElectricityBillCreateNestedManyWithoutTenantInput = {
    create?: XOR<ElectricityBillCreateWithoutTenantInput, ElectricityBillUncheckedCreateWithoutTenantInput> | ElectricityBillCreateWithoutTenantInput[] | ElectricityBillUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ElectricityBillCreateOrConnectWithoutTenantInput | ElectricityBillCreateOrConnectWithoutTenantInput[]
    createMany?: ElectricityBillCreateManyTenantInputEnvelope
    connect?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
  }

  export type NotificationCreateNestedManyWithoutUserInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type PropertyUncheckedCreateNestedManyWithoutLandlordInput = {
    create?: XOR<PropertyCreateWithoutLandlordInput, PropertyUncheckedCreateWithoutLandlordInput> | PropertyCreateWithoutLandlordInput[] | PropertyUncheckedCreateWithoutLandlordInput[]
    connectOrCreate?: PropertyCreateOrConnectWithoutLandlordInput | PropertyCreateOrConnectWithoutLandlordInput[]
    createMany?: PropertyCreateManyLandlordInputEnvelope
    connect?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
  }

  export type UnitUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<UnitCreateWithoutTenantInput, UnitUncheckedCreateWithoutTenantInput> | UnitCreateWithoutTenantInput[] | UnitUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UnitCreateOrConnectWithoutTenantInput | UnitCreateOrConnectWithoutTenantInput[]
    createMany?: UnitCreateManyTenantInputEnvelope
    connect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
  }

  export type RentPaymentUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<RentPaymentCreateWithoutTenantInput, RentPaymentUncheckedCreateWithoutTenantInput> | RentPaymentCreateWithoutTenantInput[] | RentPaymentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: RentPaymentCreateOrConnectWithoutTenantInput | RentPaymentCreateOrConnectWithoutTenantInput[]
    createMany?: RentPaymentCreateManyTenantInputEnvelope
    connect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
  }

  export type WaterBillUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<WaterBillCreateWithoutTenantInput, WaterBillUncheckedCreateWithoutTenantInput> | WaterBillCreateWithoutTenantInput[] | WaterBillUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: WaterBillCreateOrConnectWithoutTenantInput | WaterBillCreateOrConnectWithoutTenantInput[]
    createMany?: WaterBillCreateManyTenantInputEnvelope
    connect?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
  }

  export type ElectricityBillUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<ElectricityBillCreateWithoutTenantInput, ElectricityBillUncheckedCreateWithoutTenantInput> | ElectricityBillCreateWithoutTenantInput[] | ElectricityBillUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ElectricityBillCreateOrConnectWithoutTenantInput | ElectricityBillCreateOrConnectWithoutTenantInput[]
    createMany?: ElectricityBillCreateManyTenantInputEnvelope
    connect?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
  }

  export type NotificationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PropertyUpdateManyWithoutLandlordNestedInput = {
    create?: XOR<PropertyCreateWithoutLandlordInput, PropertyUncheckedCreateWithoutLandlordInput> | PropertyCreateWithoutLandlordInput[] | PropertyUncheckedCreateWithoutLandlordInput[]
    connectOrCreate?: PropertyCreateOrConnectWithoutLandlordInput | PropertyCreateOrConnectWithoutLandlordInput[]
    upsert?: PropertyUpsertWithWhereUniqueWithoutLandlordInput | PropertyUpsertWithWhereUniqueWithoutLandlordInput[]
    createMany?: PropertyCreateManyLandlordInputEnvelope
    set?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
    disconnect?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
    delete?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
    connect?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
    update?: PropertyUpdateWithWhereUniqueWithoutLandlordInput | PropertyUpdateWithWhereUniqueWithoutLandlordInput[]
    updateMany?: PropertyUpdateManyWithWhereWithoutLandlordInput | PropertyUpdateManyWithWhereWithoutLandlordInput[]
    deleteMany?: PropertyScalarWhereInput | PropertyScalarWhereInput[]
  }

  export type UnitUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UnitCreateWithoutTenantInput, UnitUncheckedCreateWithoutTenantInput> | UnitCreateWithoutTenantInput[] | UnitUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UnitCreateOrConnectWithoutTenantInput | UnitCreateOrConnectWithoutTenantInput[]
    upsert?: UnitUpsertWithWhereUniqueWithoutTenantInput | UnitUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UnitCreateManyTenantInputEnvelope
    set?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    disconnect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    delete?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    connect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    update?: UnitUpdateWithWhereUniqueWithoutTenantInput | UnitUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UnitUpdateManyWithWhereWithoutTenantInput | UnitUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UnitScalarWhereInput | UnitScalarWhereInput[]
  }

  export type RentPaymentUpdateManyWithoutTenantNestedInput = {
    create?: XOR<RentPaymentCreateWithoutTenantInput, RentPaymentUncheckedCreateWithoutTenantInput> | RentPaymentCreateWithoutTenantInput[] | RentPaymentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: RentPaymentCreateOrConnectWithoutTenantInput | RentPaymentCreateOrConnectWithoutTenantInput[]
    upsert?: RentPaymentUpsertWithWhereUniqueWithoutTenantInput | RentPaymentUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: RentPaymentCreateManyTenantInputEnvelope
    set?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    disconnect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    delete?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    connect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    update?: RentPaymentUpdateWithWhereUniqueWithoutTenantInput | RentPaymentUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: RentPaymentUpdateManyWithWhereWithoutTenantInput | RentPaymentUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: RentPaymentScalarWhereInput | RentPaymentScalarWhereInput[]
  }

  export type WaterBillUpdateManyWithoutTenantNestedInput = {
    create?: XOR<WaterBillCreateWithoutTenantInput, WaterBillUncheckedCreateWithoutTenantInput> | WaterBillCreateWithoutTenantInput[] | WaterBillUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: WaterBillCreateOrConnectWithoutTenantInput | WaterBillCreateOrConnectWithoutTenantInput[]
    upsert?: WaterBillUpsertWithWhereUniqueWithoutTenantInput | WaterBillUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: WaterBillCreateManyTenantInputEnvelope
    set?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
    disconnect?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
    delete?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
    connect?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
    update?: WaterBillUpdateWithWhereUniqueWithoutTenantInput | WaterBillUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: WaterBillUpdateManyWithWhereWithoutTenantInput | WaterBillUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: WaterBillScalarWhereInput | WaterBillScalarWhereInput[]
  }

  export type ElectricityBillUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ElectricityBillCreateWithoutTenantInput, ElectricityBillUncheckedCreateWithoutTenantInput> | ElectricityBillCreateWithoutTenantInput[] | ElectricityBillUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ElectricityBillCreateOrConnectWithoutTenantInput | ElectricityBillCreateOrConnectWithoutTenantInput[]
    upsert?: ElectricityBillUpsertWithWhereUniqueWithoutTenantInput | ElectricityBillUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ElectricityBillCreateManyTenantInputEnvelope
    set?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
    disconnect?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
    delete?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
    connect?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
    update?: ElectricityBillUpdateWithWhereUniqueWithoutTenantInput | ElectricityBillUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ElectricityBillUpdateManyWithWhereWithoutTenantInput | ElectricityBillUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ElectricityBillScalarWhereInput | ElectricityBillScalarWhereInput[]
  }

  export type NotificationUpdateManyWithoutUserNestedInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutUserInput | NotificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutUserInput | NotificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutUserInput | NotificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PropertyUncheckedUpdateManyWithoutLandlordNestedInput = {
    create?: XOR<PropertyCreateWithoutLandlordInput, PropertyUncheckedCreateWithoutLandlordInput> | PropertyCreateWithoutLandlordInput[] | PropertyUncheckedCreateWithoutLandlordInput[]
    connectOrCreate?: PropertyCreateOrConnectWithoutLandlordInput | PropertyCreateOrConnectWithoutLandlordInput[]
    upsert?: PropertyUpsertWithWhereUniqueWithoutLandlordInput | PropertyUpsertWithWhereUniqueWithoutLandlordInput[]
    createMany?: PropertyCreateManyLandlordInputEnvelope
    set?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
    disconnect?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
    delete?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
    connect?: PropertyWhereUniqueInput | PropertyWhereUniqueInput[]
    update?: PropertyUpdateWithWhereUniqueWithoutLandlordInput | PropertyUpdateWithWhereUniqueWithoutLandlordInput[]
    updateMany?: PropertyUpdateManyWithWhereWithoutLandlordInput | PropertyUpdateManyWithWhereWithoutLandlordInput[]
    deleteMany?: PropertyScalarWhereInput | PropertyScalarWhereInput[]
  }

  export type UnitUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UnitCreateWithoutTenantInput, UnitUncheckedCreateWithoutTenantInput> | UnitCreateWithoutTenantInput[] | UnitUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UnitCreateOrConnectWithoutTenantInput | UnitCreateOrConnectWithoutTenantInput[]
    upsert?: UnitUpsertWithWhereUniqueWithoutTenantInput | UnitUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UnitCreateManyTenantInputEnvelope
    set?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    disconnect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    delete?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    connect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    update?: UnitUpdateWithWhereUniqueWithoutTenantInput | UnitUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UnitUpdateManyWithWhereWithoutTenantInput | UnitUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UnitScalarWhereInput | UnitScalarWhereInput[]
  }

  export type RentPaymentUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<RentPaymentCreateWithoutTenantInput, RentPaymentUncheckedCreateWithoutTenantInput> | RentPaymentCreateWithoutTenantInput[] | RentPaymentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: RentPaymentCreateOrConnectWithoutTenantInput | RentPaymentCreateOrConnectWithoutTenantInput[]
    upsert?: RentPaymentUpsertWithWhereUniqueWithoutTenantInput | RentPaymentUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: RentPaymentCreateManyTenantInputEnvelope
    set?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    disconnect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    delete?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    connect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    update?: RentPaymentUpdateWithWhereUniqueWithoutTenantInput | RentPaymentUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: RentPaymentUpdateManyWithWhereWithoutTenantInput | RentPaymentUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: RentPaymentScalarWhereInput | RentPaymentScalarWhereInput[]
  }

  export type WaterBillUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<WaterBillCreateWithoutTenantInput, WaterBillUncheckedCreateWithoutTenantInput> | WaterBillCreateWithoutTenantInput[] | WaterBillUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: WaterBillCreateOrConnectWithoutTenantInput | WaterBillCreateOrConnectWithoutTenantInput[]
    upsert?: WaterBillUpsertWithWhereUniqueWithoutTenantInput | WaterBillUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: WaterBillCreateManyTenantInputEnvelope
    set?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
    disconnect?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
    delete?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
    connect?: WaterBillWhereUniqueInput | WaterBillWhereUniqueInput[]
    update?: WaterBillUpdateWithWhereUniqueWithoutTenantInput | WaterBillUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: WaterBillUpdateManyWithWhereWithoutTenantInput | WaterBillUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: WaterBillScalarWhereInput | WaterBillScalarWhereInput[]
  }

  export type ElectricityBillUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ElectricityBillCreateWithoutTenantInput, ElectricityBillUncheckedCreateWithoutTenantInput> | ElectricityBillCreateWithoutTenantInput[] | ElectricityBillUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ElectricityBillCreateOrConnectWithoutTenantInput | ElectricityBillCreateOrConnectWithoutTenantInput[]
    upsert?: ElectricityBillUpsertWithWhereUniqueWithoutTenantInput | ElectricityBillUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ElectricityBillCreateManyTenantInputEnvelope
    set?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
    disconnect?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
    delete?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
    connect?: ElectricityBillWhereUniqueInput | ElectricityBillWhereUniqueInput[]
    update?: ElectricityBillUpdateWithWhereUniqueWithoutTenantInput | ElectricityBillUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ElectricityBillUpdateManyWithWhereWithoutTenantInput | ElectricityBillUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ElectricityBillScalarWhereInput | ElectricityBillScalarWhereInput[]
  }

  export type NotificationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutUserInput | NotificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutUserInput | NotificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutUserInput | NotificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPropertiesInput = {
    create?: XOR<UserCreateWithoutPropertiesInput, UserUncheckedCreateWithoutPropertiesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPropertiesInput
    connect?: UserWhereUniqueInput
  }

  export type UnitCreateNestedManyWithoutPropertyInput = {
    create?: XOR<UnitCreateWithoutPropertyInput, UnitUncheckedCreateWithoutPropertyInput> | UnitCreateWithoutPropertyInput[] | UnitUncheckedCreateWithoutPropertyInput[]
    connectOrCreate?: UnitCreateOrConnectWithoutPropertyInput | UnitCreateOrConnectWithoutPropertyInput[]
    createMany?: UnitCreateManyPropertyInputEnvelope
    connect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
  }

  export type UnitUncheckedCreateNestedManyWithoutPropertyInput = {
    create?: XOR<UnitCreateWithoutPropertyInput, UnitUncheckedCreateWithoutPropertyInput> | UnitCreateWithoutPropertyInput[] | UnitUncheckedCreateWithoutPropertyInput[]
    connectOrCreate?: UnitCreateOrConnectWithoutPropertyInput | UnitCreateOrConnectWithoutPropertyInput[]
    createMany?: UnitCreateManyPropertyInputEnvelope
    connect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutPropertiesNestedInput = {
    create?: XOR<UserCreateWithoutPropertiesInput, UserUncheckedCreateWithoutPropertiesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPropertiesInput
    upsert?: UserUpsertWithoutPropertiesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPropertiesInput, UserUpdateWithoutPropertiesInput>, UserUncheckedUpdateWithoutPropertiesInput>
  }

  export type UnitUpdateManyWithoutPropertyNestedInput = {
    create?: XOR<UnitCreateWithoutPropertyInput, UnitUncheckedCreateWithoutPropertyInput> | UnitCreateWithoutPropertyInput[] | UnitUncheckedCreateWithoutPropertyInput[]
    connectOrCreate?: UnitCreateOrConnectWithoutPropertyInput | UnitCreateOrConnectWithoutPropertyInput[]
    upsert?: UnitUpsertWithWhereUniqueWithoutPropertyInput | UnitUpsertWithWhereUniqueWithoutPropertyInput[]
    createMany?: UnitCreateManyPropertyInputEnvelope
    set?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    disconnect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    delete?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    connect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    update?: UnitUpdateWithWhereUniqueWithoutPropertyInput | UnitUpdateWithWhereUniqueWithoutPropertyInput[]
    updateMany?: UnitUpdateManyWithWhereWithoutPropertyInput | UnitUpdateManyWithWhereWithoutPropertyInput[]
    deleteMany?: UnitScalarWhereInput | UnitScalarWhereInput[]
  }

  export type UnitUncheckedUpdateManyWithoutPropertyNestedInput = {
    create?: XOR<UnitCreateWithoutPropertyInput, UnitUncheckedCreateWithoutPropertyInput> | UnitCreateWithoutPropertyInput[] | UnitUncheckedCreateWithoutPropertyInput[]
    connectOrCreate?: UnitCreateOrConnectWithoutPropertyInput | UnitCreateOrConnectWithoutPropertyInput[]
    upsert?: UnitUpsertWithWhereUniqueWithoutPropertyInput | UnitUpsertWithWhereUniqueWithoutPropertyInput[]
    createMany?: UnitCreateManyPropertyInputEnvelope
    set?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    disconnect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    delete?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    connect?: UnitWhereUniqueInput | UnitWhereUniqueInput[]
    update?: UnitUpdateWithWhereUniqueWithoutPropertyInput | UnitUpdateWithWhereUniqueWithoutPropertyInput[]
    updateMany?: UnitUpdateManyWithWhereWithoutPropertyInput | UnitUpdateManyWithWhereWithoutPropertyInput[]
    deleteMany?: UnitScalarWhereInput | UnitScalarWhereInput[]
  }

  export type PropertyCreateNestedOneWithoutUnitsInput = {
    create?: XOR<PropertyCreateWithoutUnitsInput, PropertyUncheckedCreateWithoutUnitsInput>
    connectOrCreate?: PropertyCreateOrConnectWithoutUnitsInput
    connect?: PropertyWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutUnitsInput = {
    create?: XOR<UserCreateWithoutUnitsInput, UserUncheckedCreateWithoutUnitsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUnitsInput
    connect?: UserWhereUniqueInput
  }

  export type RentPaymentCreateNestedManyWithoutUnitInput = {
    create?: XOR<RentPaymentCreateWithoutUnitInput, RentPaymentUncheckedCreateWithoutUnitInput> | RentPaymentCreateWithoutUnitInput[] | RentPaymentUncheckedCreateWithoutUnitInput[]
    connectOrCreate?: RentPaymentCreateOrConnectWithoutUnitInput | RentPaymentCreateOrConnectWithoutUnitInput[]
    createMany?: RentPaymentCreateManyUnitInputEnvelope
    connect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
  }

  export type RentPaymentUncheckedCreateNestedManyWithoutUnitInput = {
    create?: XOR<RentPaymentCreateWithoutUnitInput, RentPaymentUncheckedCreateWithoutUnitInput> | RentPaymentCreateWithoutUnitInput[] | RentPaymentUncheckedCreateWithoutUnitInput[]
    connectOrCreate?: RentPaymentCreateOrConnectWithoutUnitInput | RentPaymentCreateOrConnectWithoutUnitInput[]
    createMany?: RentPaymentCreateManyUnitInputEnvelope
    connect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PropertyUpdateOneRequiredWithoutUnitsNestedInput = {
    create?: XOR<PropertyCreateWithoutUnitsInput, PropertyUncheckedCreateWithoutUnitsInput>
    connectOrCreate?: PropertyCreateOrConnectWithoutUnitsInput
    upsert?: PropertyUpsertWithoutUnitsInput
    connect?: PropertyWhereUniqueInput
    update?: XOR<XOR<PropertyUpdateToOneWithWhereWithoutUnitsInput, PropertyUpdateWithoutUnitsInput>, PropertyUncheckedUpdateWithoutUnitsInput>
  }

  export type UserUpdateOneWithoutUnitsNestedInput = {
    create?: XOR<UserCreateWithoutUnitsInput, UserUncheckedCreateWithoutUnitsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUnitsInput
    upsert?: UserUpsertWithoutUnitsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUnitsInput, UserUpdateWithoutUnitsInput>, UserUncheckedUpdateWithoutUnitsInput>
  }

  export type RentPaymentUpdateManyWithoutUnitNestedInput = {
    create?: XOR<RentPaymentCreateWithoutUnitInput, RentPaymentUncheckedCreateWithoutUnitInput> | RentPaymentCreateWithoutUnitInput[] | RentPaymentUncheckedCreateWithoutUnitInput[]
    connectOrCreate?: RentPaymentCreateOrConnectWithoutUnitInput | RentPaymentCreateOrConnectWithoutUnitInput[]
    upsert?: RentPaymentUpsertWithWhereUniqueWithoutUnitInput | RentPaymentUpsertWithWhereUniqueWithoutUnitInput[]
    createMany?: RentPaymentCreateManyUnitInputEnvelope
    set?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    disconnect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    delete?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    connect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    update?: RentPaymentUpdateWithWhereUniqueWithoutUnitInput | RentPaymentUpdateWithWhereUniqueWithoutUnitInput[]
    updateMany?: RentPaymentUpdateManyWithWhereWithoutUnitInput | RentPaymentUpdateManyWithWhereWithoutUnitInput[]
    deleteMany?: RentPaymentScalarWhereInput | RentPaymentScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type RentPaymentUncheckedUpdateManyWithoutUnitNestedInput = {
    create?: XOR<RentPaymentCreateWithoutUnitInput, RentPaymentUncheckedCreateWithoutUnitInput> | RentPaymentCreateWithoutUnitInput[] | RentPaymentUncheckedCreateWithoutUnitInput[]
    connectOrCreate?: RentPaymentCreateOrConnectWithoutUnitInput | RentPaymentCreateOrConnectWithoutUnitInput[]
    upsert?: RentPaymentUpsertWithWhereUniqueWithoutUnitInput | RentPaymentUpsertWithWhereUniqueWithoutUnitInput[]
    createMany?: RentPaymentCreateManyUnitInputEnvelope
    set?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    disconnect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    delete?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    connect?: RentPaymentWhereUniqueInput | RentPaymentWhereUniqueInput[]
    update?: RentPaymentUpdateWithWhereUniqueWithoutUnitInput | RentPaymentUpdateWithWhereUniqueWithoutUnitInput[]
    updateMany?: RentPaymentUpdateManyWithWhereWithoutUnitInput | RentPaymentUpdateManyWithWhereWithoutUnitInput[]
    deleteMany?: RentPaymentScalarWhereInput | RentPaymentScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput
    connect?: UserWhereUniqueInput
  }

  export type UnitCreateNestedOneWithoutRentPaymentsInput = {
    create?: XOR<UnitCreateWithoutRentPaymentsInput, UnitUncheckedCreateWithoutRentPaymentsInput>
    connectOrCreate?: UnitCreateOrConnectWithoutRentPaymentsInput
    connect?: UnitWhereUniqueInput
  }

  export type EnumPaymentStatusFieldUpdateOperationsInput = {
    set?: $Enums.PaymentStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput
    upsert?: UserUpsertWithoutPaymentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPaymentsInput, UserUpdateWithoutPaymentsInput>, UserUncheckedUpdateWithoutPaymentsInput>
  }

  export type UnitUpdateOneRequiredWithoutRentPaymentsNestedInput = {
    create?: XOR<UnitCreateWithoutRentPaymentsInput, UnitUncheckedCreateWithoutRentPaymentsInput>
    connectOrCreate?: UnitCreateOrConnectWithoutRentPaymentsInput
    upsert?: UnitUpsertWithoutRentPaymentsInput
    connect?: UnitWhereUniqueInput
    update?: XOR<XOR<UnitUpdateToOneWithWhereWithoutRentPaymentsInput, UnitUpdateWithoutRentPaymentsInput>, UnitUncheckedUpdateWithoutRentPaymentsInput>
  }

  export type UserCreateNestedOneWithoutWaterBillsInput = {
    create?: XOR<UserCreateWithoutWaterBillsInput, UserUncheckedCreateWithoutWaterBillsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWaterBillsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutWaterBillsNestedInput = {
    create?: XOR<UserCreateWithoutWaterBillsInput, UserUncheckedCreateWithoutWaterBillsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWaterBillsInput
    upsert?: UserUpsertWithoutWaterBillsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWaterBillsInput, UserUpdateWithoutWaterBillsInput>, UserUncheckedUpdateWithoutWaterBillsInput>
  }

  export type UserCreateNestedOneWithoutElectricityBillsInput = {
    create?: XOR<UserCreateWithoutElectricityBillsInput, UserUncheckedCreateWithoutElectricityBillsInput>
    connectOrCreate?: UserCreateOrConnectWithoutElectricityBillsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutElectricityBillsNestedInput = {
    create?: XOR<UserCreateWithoutElectricityBillsInput, UserUncheckedCreateWithoutElectricityBillsInput>
    connectOrCreate?: UserCreateOrConnectWithoutElectricityBillsInput
    upsert?: UserUpsertWithoutElectricityBillsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutElectricityBillsInput, UserUpdateWithoutElectricityBillsInput>, UserUncheckedUpdateWithoutElectricityBillsInput>
  }

  export type UserCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotificationsInput
    connect?: UserWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutNotificationsNestedInput = {
    create?: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotificationsInput
    upsert?: UserUpsertWithoutNotificationsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutNotificationsInput, UserUpdateWithoutNotificationsInput>, UserUncheckedUpdateWithoutNotificationsInput>
  }

  export type POICreateembeddingInput = {
    set: number[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type POIUpdateembeddingInput = {
    set?: number[]
    push?: number | number[]
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type PropertyCreateWithoutLandlordInput = {
    name: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    units?: UnitCreateNestedManyWithoutPropertyInput
  }

  export type PropertyUncheckedCreateWithoutLandlordInput = {
    id?: number
    name: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    units?: UnitUncheckedCreateNestedManyWithoutPropertyInput
  }

  export type PropertyCreateOrConnectWithoutLandlordInput = {
    where: PropertyWhereUniqueInput
    create: XOR<PropertyCreateWithoutLandlordInput, PropertyUncheckedCreateWithoutLandlordInput>
  }

  export type PropertyCreateManyLandlordInputEnvelope = {
    data: PropertyCreateManyLandlordInput | PropertyCreateManyLandlordInput[]
    skipDuplicates?: boolean
  }

  export type UnitCreateWithoutTenantInput = {
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
    property: PropertyCreateNestedOneWithoutUnitsInput
    rentPayments?: RentPaymentCreateNestedManyWithoutUnitInput
  }

  export type UnitUncheckedCreateWithoutTenantInput = {
    id?: number
    propertyId: number
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rentPayments?: RentPaymentUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitCreateOrConnectWithoutTenantInput = {
    where: UnitWhereUniqueInput
    create: XOR<UnitCreateWithoutTenantInput, UnitUncheckedCreateWithoutTenantInput>
  }

  export type UnitCreateManyTenantInputEnvelope = {
    data: UnitCreateManyTenantInput | UnitCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type RentPaymentCreateWithoutTenantInput = {
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    unit: UnitCreateNestedOneWithoutRentPaymentsInput
  }

  export type RentPaymentUncheckedCreateWithoutTenantInput = {
    id?: number
    unitId: number
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RentPaymentCreateOrConnectWithoutTenantInput = {
    where: RentPaymentWhereUniqueInput
    create: XOR<RentPaymentCreateWithoutTenantInput, RentPaymentUncheckedCreateWithoutTenantInput>
  }

  export type RentPaymentCreateManyTenantInputEnvelope = {
    data: RentPaymentCreateManyTenantInput | RentPaymentCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type WaterBillCreateWithoutTenantInput = {
    reading: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaterBillUncheckedCreateWithoutTenantInput = {
    id?: number
    reading: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaterBillCreateOrConnectWithoutTenantInput = {
    where: WaterBillWhereUniqueInput
    create: XOR<WaterBillCreateWithoutTenantInput, WaterBillUncheckedCreateWithoutTenantInput>
  }

  export type WaterBillCreateManyTenantInputEnvelope = {
    data: WaterBillCreateManyTenantInput | WaterBillCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type ElectricityBillCreateWithoutTenantInput = {
    tokens: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElectricityBillUncheckedCreateWithoutTenantInput = {
    id?: number
    tokens: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElectricityBillCreateOrConnectWithoutTenantInput = {
    where: ElectricityBillWhereUniqueInput
    create: XOR<ElectricityBillCreateWithoutTenantInput, ElectricityBillUncheckedCreateWithoutTenantInput>
  }

  export type ElectricityBillCreateManyTenantInputEnvelope = {
    data: ElectricityBillCreateManyTenantInput | ElectricityBillCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type NotificationCreateWithoutUserInput = {
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUncheckedCreateWithoutUserInput = {
    id?: number
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationCreateOrConnectWithoutUserInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput>
  }

  export type NotificationCreateManyUserInputEnvelope = {
    data: NotificationCreateManyUserInput | NotificationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PropertyUpsertWithWhereUniqueWithoutLandlordInput = {
    where: PropertyWhereUniqueInput
    update: XOR<PropertyUpdateWithoutLandlordInput, PropertyUncheckedUpdateWithoutLandlordInput>
    create: XOR<PropertyCreateWithoutLandlordInput, PropertyUncheckedCreateWithoutLandlordInput>
  }

  export type PropertyUpdateWithWhereUniqueWithoutLandlordInput = {
    where: PropertyWhereUniqueInput
    data: XOR<PropertyUpdateWithoutLandlordInput, PropertyUncheckedUpdateWithoutLandlordInput>
  }

  export type PropertyUpdateManyWithWhereWithoutLandlordInput = {
    where: PropertyScalarWhereInput
    data: XOR<PropertyUpdateManyMutationInput, PropertyUncheckedUpdateManyWithoutLandlordInput>
  }

  export type PropertyScalarWhereInput = {
    AND?: PropertyScalarWhereInput | PropertyScalarWhereInput[]
    OR?: PropertyScalarWhereInput[]
    NOT?: PropertyScalarWhereInput | PropertyScalarWhereInput[]
    id?: IntFilter<"Property"> | number
    name?: StringFilter<"Property"> | string
    address?: StringFilter<"Property"> | string
    landlordId?: IntFilter<"Property"> | number
    createdAt?: DateTimeFilter<"Property"> | Date | string
    updatedAt?: DateTimeFilter<"Property"> | Date | string
  }

  export type UnitUpsertWithWhereUniqueWithoutTenantInput = {
    where: UnitWhereUniqueInput
    update: XOR<UnitUpdateWithoutTenantInput, UnitUncheckedUpdateWithoutTenantInput>
    create: XOR<UnitCreateWithoutTenantInput, UnitUncheckedCreateWithoutTenantInput>
  }

  export type UnitUpdateWithWhereUniqueWithoutTenantInput = {
    where: UnitWhereUniqueInput
    data: XOR<UnitUpdateWithoutTenantInput, UnitUncheckedUpdateWithoutTenantInput>
  }

  export type UnitUpdateManyWithWhereWithoutTenantInput = {
    where: UnitScalarWhereInput
    data: XOR<UnitUpdateManyMutationInput, UnitUncheckedUpdateManyWithoutTenantInput>
  }

  export type UnitScalarWhereInput = {
    AND?: UnitScalarWhereInput | UnitScalarWhereInput[]
    OR?: UnitScalarWhereInput[]
    NOT?: UnitScalarWhereInput | UnitScalarWhereInput[]
    id?: IntFilter<"Unit"> | number
    propertyId?: IntFilter<"Unit"> | number
    tenantId?: IntNullableFilter<"Unit"> | number | null
    rentAmount?: FloatFilter<"Unit"> | number
    createdAt?: DateTimeFilter<"Unit"> | Date | string
    updatedAt?: DateTimeFilter<"Unit"> | Date | string
  }

  export type RentPaymentUpsertWithWhereUniqueWithoutTenantInput = {
    where: RentPaymentWhereUniqueInput
    update: XOR<RentPaymentUpdateWithoutTenantInput, RentPaymentUncheckedUpdateWithoutTenantInput>
    create: XOR<RentPaymentCreateWithoutTenantInput, RentPaymentUncheckedCreateWithoutTenantInput>
  }

  export type RentPaymentUpdateWithWhereUniqueWithoutTenantInput = {
    where: RentPaymentWhereUniqueInput
    data: XOR<RentPaymentUpdateWithoutTenantInput, RentPaymentUncheckedUpdateWithoutTenantInput>
  }

  export type RentPaymentUpdateManyWithWhereWithoutTenantInput = {
    where: RentPaymentScalarWhereInput
    data: XOR<RentPaymentUpdateManyMutationInput, RentPaymentUncheckedUpdateManyWithoutTenantInput>
  }

  export type RentPaymentScalarWhereInput = {
    AND?: RentPaymentScalarWhereInput | RentPaymentScalarWhereInput[]
    OR?: RentPaymentScalarWhereInput[]
    NOT?: RentPaymentScalarWhereInput | RentPaymentScalarWhereInput[]
    id?: IntFilter<"RentPayment"> | number
    tenantId?: IntFilter<"RentPayment"> | number
    unitId?: IntFilter<"RentPayment"> | number
    amount?: FloatFilter<"RentPayment"> | number
    dueDate?: DateTimeFilter<"RentPayment"> | Date | string
    status?: EnumPaymentStatusFilter<"RentPayment"> | $Enums.PaymentStatus
    penalty?: FloatFilter<"RentPayment"> | number
    paidAt?: DateTimeNullableFilter<"RentPayment"> | Date | string | null
    createdAt?: DateTimeFilter<"RentPayment"> | Date | string
    updatedAt?: DateTimeFilter<"RentPayment"> | Date | string
  }

  export type WaterBillUpsertWithWhereUniqueWithoutTenantInput = {
    where: WaterBillWhereUniqueInput
    update: XOR<WaterBillUpdateWithoutTenantInput, WaterBillUncheckedUpdateWithoutTenantInput>
    create: XOR<WaterBillCreateWithoutTenantInput, WaterBillUncheckedCreateWithoutTenantInput>
  }

  export type WaterBillUpdateWithWhereUniqueWithoutTenantInput = {
    where: WaterBillWhereUniqueInput
    data: XOR<WaterBillUpdateWithoutTenantInput, WaterBillUncheckedUpdateWithoutTenantInput>
  }

  export type WaterBillUpdateManyWithWhereWithoutTenantInput = {
    where: WaterBillScalarWhereInput
    data: XOR<WaterBillUpdateManyMutationInput, WaterBillUncheckedUpdateManyWithoutTenantInput>
  }

  export type WaterBillScalarWhereInput = {
    AND?: WaterBillScalarWhereInput | WaterBillScalarWhereInput[]
    OR?: WaterBillScalarWhereInput[]
    NOT?: WaterBillScalarWhereInput | WaterBillScalarWhereInput[]
    id?: IntFilter<"WaterBill"> | number
    tenantId?: IntFilter<"WaterBill"> | number
    reading?: FloatFilter<"WaterBill"> | number
    amount?: FloatFilter<"WaterBill"> | number
    status?: EnumPaymentStatusFilter<"WaterBill"> | $Enums.PaymentStatus
    paidAt?: DateTimeNullableFilter<"WaterBill"> | Date | string | null
    createdAt?: DateTimeFilter<"WaterBill"> | Date | string
    updatedAt?: DateTimeFilter<"WaterBill"> | Date | string
  }

  export type ElectricityBillUpsertWithWhereUniqueWithoutTenantInput = {
    where: ElectricityBillWhereUniqueInput
    update: XOR<ElectricityBillUpdateWithoutTenantInput, ElectricityBillUncheckedUpdateWithoutTenantInput>
    create: XOR<ElectricityBillCreateWithoutTenantInput, ElectricityBillUncheckedCreateWithoutTenantInput>
  }

  export type ElectricityBillUpdateWithWhereUniqueWithoutTenantInput = {
    where: ElectricityBillWhereUniqueInput
    data: XOR<ElectricityBillUpdateWithoutTenantInput, ElectricityBillUncheckedUpdateWithoutTenantInput>
  }

  export type ElectricityBillUpdateManyWithWhereWithoutTenantInput = {
    where: ElectricityBillScalarWhereInput
    data: XOR<ElectricityBillUpdateManyMutationInput, ElectricityBillUncheckedUpdateManyWithoutTenantInput>
  }

  export type ElectricityBillScalarWhereInput = {
    AND?: ElectricityBillScalarWhereInput | ElectricityBillScalarWhereInput[]
    OR?: ElectricityBillScalarWhereInput[]
    NOT?: ElectricityBillScalarWhereInput | ElectricityBillScalarWhereInput[]
    id?: IntFilter<"ElectricityBill"> | number
    tenantId?: IntFilter<"ElectricityBill"> | number
    tokens?: IntFilter<"ElectricityBill"> | number
    amount?: FloatFilter<"ElectricityBill"> | number
    status?: EnumPaymentStatusFilter<"ElectricityBill"> | $Enums.PaymentStatus
    paidAt?: DateTimeNullableFilter<"ElectricityBill"> | Date | string | null
    createdAt?: DateTimeFilter<"ElectricityBill"> | Date | string
    updatedAt?: DateTimeFilter<"ElectricityBill"> | Date | string
  }

  export type NotificationUpsertWithWhereUniqueWithoutUserInput = {
    where: NotificationWhereUniqueInput
    update: XOR<NotificationUpdateWithoutUserInput, NotificationUncheckedUpdateWithoutUserInput>
    create: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput>
  }

  export type NotificationUpdateWithWhereUniqueWithoutUserInput = {
    where: NotificationWhereUniqueInput
    data: XOR<NotificationUpdateWithoutUserInput, NotificationUncheckedUpdateWithoutUserInput>
  }

  export type NotificationUpdateManyWithWhereWithoutUserInput = {
    where: NotificationScalarWhereInput
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyWithoutUserInput>
  }

  export type NotificationScalarWhereInput = {
    AND?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    OR?: NotificationScalarWhereInput[]
    NOT?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    id?: IntFilter<"Notification"> | number
    userId?: IntFilter<"Notification"> | number
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
  }

  export type UserCreateWithoutPropertiesInput = {
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    units?: UnitCreateNestedManyWithoutTenantInput
    payments?: RentPaymentCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillCreateNestedManyWithoutTenantInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPropertiesInput = {
    id?: number
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    units?: UnitUncheckedCreateNestedManyWithoutTenantInput
    payments?: RentPaymentUncheckedCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillUncheckedCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillUncheckedCreateNestedManyWithoutTenantInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPropertiesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPropertiesInput, UserUncheckedCreateWithoutPropertiesInput>
  }

  export type UnitCreateWithoutPropertyInput = {
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant?: UserCreateNestedOneWithoutUnitsInput
    rentPayments?: RentPaymentCreateNestedManyWithoutUnitInput
  }

  export type UnitUncheckedCreateWithoutPropertyInput = {
    id?: number
    tenantId?: number | null
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rentPayments?: RentPaymentUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitCreateOrConnectWithoutPropertyInput = {
    where: UnitWhereUniqueInput
    create: XOR<UnitCreateWithoutPropertyInput, UnitUncheckedCreateWithoutPropertyInput>
  }

  export type UnitCreateManyPropertyInputEnvelope = {
    data: UnitCreateManyPropertyInput | UnitCreateManyPropertyInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutPropertiesInput = {
    update: XOR<UserUpdateWithoutPropertiesInput, UserUncheckedUpdateWithoutPropertiesInput>
    create: XOR<UserCreateWithoutPropertiesInput, UserUncheckedCreateWithoutPropertiesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPropertiesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPropertiesInput, UserUncheckedUpdateWithoutPropertiesInput>
  }

  export type UserUpdateWithoutPropertiesInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    units?: UnitUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPropertiesInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    units?: UnitUncheckedUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUncheckedUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUncheckedUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUncheckedUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UnitUpsertWithWhereUniqueWithoutPropertyInput = {
    where: UnitWhereUniqueInput
    update: XOR<UnitUpdateWithoutPropertyInput, UnitUncheckedUpdateWithoutPropertyInput>
    create: XOR<UnitCreateWithoutPropertyInput, UnitUncheckedCreateWithoutPropertyInput>
  }

  export type UnitUpdateWithWhereUniqueWithoutPropertyInput = {
    where: UnitWhereUniqueInput
    data: XOR<UnitUpdateWithoutPropertyInput, UnitUncheckedUpdateWithoutPropertyInput>
  }

  export type UnitUpdateManyWithWhereWithoutPropertyInput = {
    where: UnitScalarWhereInput
    data: XOR<UnitUpdateManyMutationInput, UnitUncheckedUpdateManyWithoutPropertyInput>
  }

  export type PropertyCreateWithoutUnitsInput = {
    name: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    landlord: UserCreateNestedOneWithoutPropertiesInput
  }

  export type PropertyUncheckedCreateWithoutUnitsInput = {
    id?: number
    name: string
    address: string
    landlordId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PropertyCreateOrConnectWithoutUnitsInput = {
    where: PropertyWhereUniqueInput
    create: XOR<PropertyCreateWithoutUnitsInput, PropertyUncheckedCreateWithoutUnitsInput>
  }

  export type UserCreateWithoutUnitsInput = {
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyCreateNestedManyWithoutLandlordInput
    payments?: RentPaymentCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillCreateNestedManyWithoutTenantInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUnitsInput = {
    id?: number
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyUncheckedCreateNestedManyWithoutLandlordInput
    payments?: RentPaymentUncheckedCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillUncheckedCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillUncheckedCreateNestedManyWithoutTenantInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUnitsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUnitsInput, UserUncheckedCreateWithoutUnitsInput>
  }

  export type RentPaymentCreateWithoutUnitInput = {
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: UserCreateNestedOneWithoutPaymentsInput
  }

  export type RentPaymentUncheckedCreateWithoutUnitInput = {
    id?: number
    tenantId: number
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RentPaymentCreateOrConnectWithoutUnitInput = {
    where: RentPaymentWhereUniqueInput
    create: XOR<RentPaymentCreateWithoutUnitInput, RentPaymentUncheckedCreateWithoutUnitInput>
  }

  export type RentPaymentCreateManyUnitInputEnvelope = {
    data: RentPaymentCreateManyUnitInput | RentPaymentCreateManyUnitInput[]
    skipDuplicates?: boolean
  }

  export type PropertyUpsertWithoutUnitsInput = {
    update: XOR<PropertyUpdateWithoutUnitsInput, PropertyUncheckedUpdateWithoutUnitsInput>
    create: XOR<PropertyCreateWithoutUnitsInput, PropertyUncheckedCreateWithoutUnitsInput>
    where?: PropertyWhereInput
  }

  export type PropertyUpdateToOneWithWhereWithoutUnitsInput = {
    where?: PropertyWhereInput
    data: XOR<PropertyUpdateWithoutUnitsInput, PropertyUncheckedUpdateWithoutUnitsInput>
  }

  export type PropertyUpdateWithoutUnitsInput = {
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    landlord?: UserUpdateOneRequiredWithoutPropertiesNestedInput
  }

  export type PropertyUncheckedUpdateWithoutUnitsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    landlordId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutUnitsInput = {
    update: XOR<UserUpdateWithoutUnitsInput, UserUncheckedUpdateWithoutUnitsInput>
    create: XOR<UserCreateWithoutUnitsInput, UserUncheckedCreateWithoutUnitsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUnitsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUnitsInput, UserUncheckedUpdateWithoutUnitsInput>
  }

  export type UserUpdateWithoutUnitsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUpdateManyWithoutLandlordNestedInput
    payments?: RentPaymentUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUnitsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUncheckedUpdateManyWithoutLandlordNestedInput
    payments?: RentPaymentUncheckedUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUncheckedUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUncheckedUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type RentPaymentUpsertWithWhereUniqueWithoutUnitInput = {
    where: RentPaymentWhereUniqueInput
    update: XOR<RentPaymentUpdateWithoutUnitInput, RentPaymentUncheckedUpdateWithoutUnitInput>
    create: XOR<RentPaymentCreateWithoutUnitInput, RentPaymentUncheckedCreateWithoutUnitInput>
  }

  export type RentPaymentUpdateWithWhereUniqueWithoutUnitInput = {
    where: RentPaymentWhereUniqueInput
    data: XOR<RentPaymentUpdateWithoutUnitInput, RentPaymentUncheckedUpdateWithoutUnitInput>
  }

  export type RentPaymentUpdateManyWithWhereWithoutUnitInput = {
    where: RentPaymentScalarWhereInput
    data: XOR<RentPaymentUpdateManyMutationInput, RentPaymentUncheckedUpdateManyWithoutUnitInput>
  }

  export type UserCreateWithoutPaymentsInput = {
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyCreateNestedManyWithoutLandlordInput
    units?: UnitCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillCreateNestedManyWithoutTenantInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPaymentsInput = {
    id?: number
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyUncheckedCreateNestedManyWithoutLandlordInput
    units?: UnitUncheckedCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillUncheckedCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillUncheckedCreateNestedManyWithoutTenantInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPaymentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
  }

  export type UnitCreateWithoutRentPaymentsInput = {
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
    property: PropertyCreateNestedOneWithoutUnitsInput
    tenant?: UserCreateNestedOneWithoutUnitsInput
  }

  export type UnitUncheckedCreateWithoutRentPaymentsInput = {
    id?: number
    propertyId: number
    tenantId?: number | null
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitCreateOrConnectWithoutRentPaymentsInput = {
    where: UnitWhereUniqueInput
    create: XOR<UnitCreateWithoutRentPaymentsInput, UnitUncheckedCreateWithoutRentPaymentsInput>
  }

  export type UserUpsertWithoutPaymentsInput = {
    update: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>
  }

  export type UserUpdateWithoutPaymentsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUpdateManyWithoutLandlordNestedInput
    units?: UnitUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPaymentsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUncheckedUpdateManyWithoutLandlordNestedInput
    units?: UnitUncheckedUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUncheckedUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUncheckedUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UnitUpsertWithoutRentPaymentsInput = {
    update: XOR<UnitUpdateWithoutRentPaymentsInput, UnitUncheckedUpdateWithoutRentPaymentsInput>
    create: XOR<UnitCreateWithoutRentPaymentsInput, UnitUncheckedCreateWithoutRentPaymentsInput>
    where?: UnitWhereInput
  }

  export type UnitUpdateToOneWithWhereWithoutRentPaymentsInput = {
    where?: UnitWhereInput
    data: XOR<UnitUpdateWithoutRentPaymentsInput, UnitUncheckedUpdateWithoutRentPaymentsInput>
  }

  export type UnitUpdateWithoutRentPaymentsInput = {
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    property?: PropertyUpdateOneRequiredWithoutUnitsNestedInput
    tenant?: UserUpdateOneWithoutUnitsNestedInput
  }

  export type UnitUncheckedUpdateWithoutRentPaymentsInput = {
    id?: IntFieldUpdateOperationsInput | number
    propertyId?: IntFieldUpdateOperationsInput | number
    tenantId?: NullableIntFieldUpdateOperationsInput | number | null
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutWaterBillsInput = {
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyCreateNestedManyWithoutLandlordInput
    units?: UnitCreateNestedManyWithoutTenantInput
    payments?: RentPaymentCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillCreateNestedManyWithoutTenantInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutWaterBillsInput = {
    id?: number
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyUncheckedCreateNestedManyWithoutLandlordInput
    units?: UnitUncheckedCreateNestedManyWithoutTenantInput
    payments?: RentPaymentUncheckedCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillUncheckedCreateNestedManyWithoutTenantInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutWaterBillsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWaterBillsInput, UserUncheckedCreateWithoutWaterBillsInput>
  }

  export type UserUpsertWithoutWaterBillsInput = {
    update: XOR<UserUpdateWithoutWaterBillsInput, UserUncheckedUpdateWithoutWaterBillsInput>
    create: XOR<UserCreateWithoutWaterBillsInput, UserUncheckedCreateWithoutWaterBillsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWaterBillsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWaterBillsInput, UserUncheckedUpdateWithoutWaterBillsInput>
  }

  export type UserUpdateWithoutWaterBillsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUpdateManyWithoutLandlordNestedInput
    units?: UnitUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutWaterBillsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUncheckedUpdateManyWithoutLandlordNestedInput
    units?: UnitUncheckedUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUncheckedUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUncheckedUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutElectricityBillsInput = {
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyCreateNestedManyWithoutLandlordInput
    units?: UnitCreateNestedManyWithoutTenantInput
    payments?: RentPaymentCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillCreateNestedManyWithoutTenantInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutElectricityBillsInput = {
    id?: number
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyUncheckedCreateNestedManyWithoutLandlordInput
    units?: UnitUncheckedCreateNestedManyWithoutTenantInput
    payments?: RentPaymentUncheckedCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillUncheckedCreateNestedManyWithoutTenantInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutElectricityBillsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutElectricityBillsInput, UserUncheckedCreateWithoutElectricityBillsInput>
  }

  export type UserUpsertWithoutElectricityBillsInput = {
    update: XOR<UserUpdateWithoutElectricityBillsInput, UserUncheckedUpdateWithoutElectricityBillsInput>
    create: XOR<UserCreateWithoutElectricityBillsInput, UserUncheckedCreateWithoutElectricityBillsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutElectricityBillsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutElectricityBillsInput, UserUncheckedUpdateWithoutElectricityBillsInput>
  }

  export type UserUpdateWithoutElectricityBillsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUpdateManyWithoutLandlordNestedInput
    units?: UnitUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutElectricityBillsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUncheckedUpdateManyWithoutLandlordNestedInput
    units?: UnitUncheckedUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUncheckedUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUncheckedUpdateManyWithoutTenantNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutNotificationsInput = {
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyCreateNestedManyWithoutLandlordInput
    units?: UnitCreateNestedManyWithoutTenantInput
    payments?: RentPaymentCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillCreateNestedManyWithoutTenantInput
  }

  export type UserUncheckedCreateWithoutNotificationsInput = {
    id?: number
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    properties?: PropertyUncheckedCreateNestedManyWithoutLandlordInput
    units?: UnitUncheckedCreateNestedManyWithoutTenantInput
    payments?: RentPaymentUncheckedCreateNestedManyWithoutTenantInput
    waterBills?: WaterBillUncheckedCreateNestedManyWithoutTenantInput
    electricityBills?: ElectricityBillUncheckedCreateNestedManyWithoutTenantInput
  }

  export type UserCreateOrConnectWithoutNotificationsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
  }

  export type UserUpsertWithoutNotificationsInput = {
    update: XOR<UserUpdateWithoutNotificationsInput, UserUncheckedUpdateWithoutNotificationsInput>
    create: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutNotificationsInput, UserUncheckedUpdateWithoutNotificationsInput>
  }

  export type UserUpdateWithoutNotificationsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUpdateManyWithoutLandlordNestedInput
    units?: UnitUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUpdateManyWithoutTenantNestedInput
  }

  export type UserUncheckedUpdateWithoutNotificationsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    properties?: PropertyUncheckedUpdateManyWithoutLandlordNestedInput
    units?: UnitUncheckedUpdateManyWithoutTenantNestedInput
    payments?: RentPaymentUncheckedUpdateManyWithoutTenantNestedInput
    waterBills?: WaterBillUncheckedUpdateManyWithoutTenantNestedInput
    electricityBills?: ElectricityBillUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type PropertyCreateManyLandlordInput = {
    id?: number
    name: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitCreateManyTenantInput = {
    id?: number
    propertyId: number
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RentPaymentCreateManyTenantInput = {
    id?: number
    unitId: number
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaterBillCreateManyTenantInput = {
    id?: number
    reading: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElectricityBillCreateManyTenantInput = {
    id?: number
    tokens: number
    amount: number
    status?: $Enums.PaymentStatus
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationCreateManyUserInput = {
    id?: number
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PropertyUpdateWithoutLandlordInput = {
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    units?: UnitUpdateManyWithoutPropertyNestedInput
  }

  export type PropertyUncheckedUpdateWithoutLandlordInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    units?: UnitUncheckedUpdateManyWithoutPropertyNestedInput
  }

  export type PropertyUncheckedUpdateManyWithoutLandlordInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitUpdateWithoutTenantInput = {
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    property?: PropertyUpdateOneRequiredWithoutUnitsNestedInput
    rentPayments?: RentPaymentUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateWithoutTenantInput = {
    id?: IntFieldUpdateOperationsInput | number
    propertyId?: IntFieldUpdateOperationsInput | number
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rentPayments?: RentPaymentUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateManyWithoutTenantInput = {
    id?: IntFieldUpdateOperationsInput | number
    propertyId?: IntFieldUpdateOperationsInput | number
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RentPaymentUpdateWithoutTenantInput = {
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    unit?: UnitUpdateOneRequiredWithoutRentPaymentsNestedInput
  }

  export type RentPaymentUncheckedUpdateWithoutTenantInput = {
    id?: IntFieldUpdateOperationsInput | number
    unitId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RentPaymentUncheckedUpdateManyWithoutTenantInput = {
    id?: IntFieldUpdateOperationsInput | number
    unitId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterBillUpdateWithoutTenantInput = {
    reading?: FloatFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterBillUncheckedUpdateWithoutTenantInput = {
    id?: IntFieldUpdateOperationsInput | number
    reading?: FloatFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterBillUncheckedUpdateManyWithoutTenantInput = {
    id?: IntFieldUpdateOperationsInput | number
    reading?: FloatFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElectricityBillUpdateWithoutTenantInput = {
    tokens?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElectricityBillUncheckedUpdateWithoutTenantInput = {
    id?: IntFieldUpdateOperationsInput | number
    tokens?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElectricityBillUncheckedUpdateManyWithoutTenantInput = {
    id?: IntFieldUpdateOperationsInput | number
    tokens?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUpdateWithoutUserInput = {
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitCreateManyPropertyInput = {
    id?: number
    tenantId?: number | null
    rentAmount: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitUpdateWithoutPropertyInput = {
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: UserUpdateOneWithoutUnitsNestedInput
    rentPayments?: RentPaymentUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateWithoutPropertyInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: NullableIntFieldUpdateOperationsInput | number | null
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rentPayments?: RentPaymentUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateManyWithoutPropertyInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: NullableIntFieldUpdateOperationsInput | number | null
    rentAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RentPaymentCreateManyUnitInput = {
    id?: number
    tenantId: number
    amount: number
    dueDate: Date | string
    status?: $Enums.PaymentStatus
    penalty?: number
    paidAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RentPaymentUpdateWithoutUnitInput = {
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: UserUpdateOneRequiredWithoutPaymentsNestedInput
  }

  export type RentPaymentUncheckedUpdateWithoutUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RentPaymentUncheckedUpdateManyWithoutUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    tenantId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    penalty?: FloatFieldUpdateOperationsInput | number
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}