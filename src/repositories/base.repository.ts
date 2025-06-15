/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore

import {
  DataSource,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { BaseFilter } from '../shared/base.filter';

class Filterable {
  public static buildQuery<T>(
    Class: Class, // @ts-ignore
    queryBuilder: SelectQueryBuilder<T>,
    { filter = {}, skip = 0, limit = 10 }: BaseFilter, // @ts-ignore
  ): SelectQueryBuilder<T> {
    const instance = new Class({});
    Object.entries(filter).forEach(([property, value]) => {
      if (Object.prototype.hasOwnProperty.call(instance, property) && value) {
        queryBuilder.andWhere({
          [property]: value,
        });
      }
    });
    queryBuilder.skip(skip);
    if (limit) queryBuilder.take(limit);
    return queryBuilder;
  }
}
// @ts-ignore
export abstract class BaseRepository<T> extends Repository<T> {
  private _target: Class;

  constructor(
    target: Class,
    private _baseDataSource: DataSource,
  ) {
    super(target, _baseDataSource.createEntityManager());
    this._target = target;
  }

  public _buildQuery(
    query: BaseFilter,
    // @ts-ignore
    queryBuilder?: SelectQueryBuilder<T>,
    // @ts-ignore
  ): SelectQueryBuilder<T> {
    if (queryBuilder) {
      return Filterable.buildQuery(this._target, queryBuilder, query);
    }
    const newQueryBuilder = this.createQueryBuilder();
    return Filterable.buildQuery(this._target, newQueryBuilder, query);
  }

  public async executeTransaction<T>(
    fn: (queryRunner: QueryRunner) => Promise<T>,
    isolationLevel: IsolationLevel = 'READ COMMITTED',
  ) {
    const queryRunner = this._baseDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);
    try {
      queryRunner.manager.getRepository(this._target);
      const result = await fn(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public getRepository<E extends ObjectLiteral>(
    queryRunner: QueryRunner,
  ): Repository<E> {
    return queryRunner.manager.getRepository(this._target);
  }
}
