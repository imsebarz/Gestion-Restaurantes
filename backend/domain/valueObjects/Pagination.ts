export class Cursor {
  constructor(public readonly value: string) {}

  public static fromId(id: number): Cursor {
    return new Cursor(Buffer.from(id.toString()).toString("base64"));
  }

  public toId(): number {
    return parseInt(Buffer.from(this.value, "base64").toString("ascii"));
  }

  public static empty(): Cursor {
    return new Cursor("");
  }

  public isEmpty(): boolean {
    return this.value === "";
  }
}

export class PaginationInfo {
  constructor(
    public readonly hasNextPage: boolean,
    public readonly hasPreviousPage: boolean,
    public readonly startCursor?: Cursor,
    public readonly endCursor?: Cursor,
  ) {}
}

export class Edge<T> {
  constructor(
    public readonly node: T,
    public readonly cursor: Cursor,
  ) {}
}

export class Connection<T> {
  constructor(
    public readonly edges: Edge<T>[],
    public readonly pageInfo: PaginationInfo,
  ) {}
}
