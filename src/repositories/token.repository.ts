import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Token } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class TokenRepository extends BaseRepository<Token> {
  constructor(private _dataSource: DataSource) {
    super(Token, _dataSource);
  }
}
